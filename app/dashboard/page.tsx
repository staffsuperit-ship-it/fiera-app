'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function Dashboard() {
  const [contatti, setContatti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)

  const fetchContatti = async () => {
    setLoading(true)
    // Selezioniamo esplicitamente tutti i campi per essere sicuri
    const { data, error } = await supabase
        .from('contatti')
        .select('*, fiere(nome_fiera), operatori(nome)')
        .order('created_at', { ascending: false })
    
    if (error) console.error("Errore DB:", error.message)
    if (data) setContatti(data)
    setLoading(false)
  }

  useEffect(() => { fetchContatti() }, [])

  const saveEdit = async () => {
    const { error } = await supabase.from('contatti').update({ 
        nome: editData.nome, 
        cognome: editData.cognome, 
        azienda_cliente: editData.azienda_cliente, 
        telefono: editData.telefono,
        email: editData.email,
        note: editData.note 
    }).eq('id', editId)
    
    if (error) alert("Errore: " + error.message)
    else { setEditId(null); fetchContatti(); }
  }

  const downloadExcel = () => {
    const dati = contatti.map(c => ({
      Data: new Date(c.created_at).toLocaleString(),
      Brand_Stand: c.azienda_gruppo,
      Azienda_Lead: c.azienda_cliente,
      Nome: c.nome, Cognome: c.cognome,
      Tel: c.telefono, Email: c.email, Note: c.note,
      Fiera: c.fiere?.nome_fiera,
      Foto_Link: c.foto_biglietto_url || 'No foto'
    }))
    const ws = XLSX.utils.json_to_sheet(dati)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Lead")
    XLSX.writeFile(wb, "Report_Lead_Completo.xlsx")
  }

  return (
    <main className="p-2 md:p-8 text-black min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER RESPONSIVO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-2xl shadow-sm">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black">Report Lead</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Database Acquisizioni</p>
          </div>
          <button onClick={downloadExcel} className="w-full md:w-auto bg-green-600 text-white px-10 py-3 rounded-xl font-black shadow-lg">SCARICA EXCEL</button>
        </div>

        {/* TABELLA CON CONTROLLO OVERFLOW */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left min-w-[900px] border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Lead / Azienda</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Contatti / Note</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Stand / Fiera</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase text-center">Azioni / Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contatti.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* COLONNA 1: NOMI */}
                    <td className="p-4 align-top">
                      {editId === c.id ? (
                        <div className="flex flex-col gap-1">
                          <input className="border p-2 rounded text-xs" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} placeholder="Nome" />
                          <input className="border p-2 rounded text-xs" value={editData.cognome} onChange={e => setEditData({...editData, cognome: e.target.value})} placeholder="Cognome" />
                          <input className="border p-2 rounded text-xs font-bold" value={editData.azienda_cliente} onChange={e => setEditData({...editData, azienda_cliente: e.target.value})} placeholder="Azienda" />
                        </div>
                      ) : (
                        <div className="max-w-[200px]">
                            <div className="font-black text-blue-900 truncate">{c.nome} {c.cognome}</div>
                            <div className="text-[11px] font-bold text-gray-400 truncate">{c.azienda_cliente || 'Nessuna Azienda'}</div>
                        </div>
                      )}
                    </td>

                    {/* COLONNA 2: DATI */}
                    <td className="p-4 align-top">
                      {editId === c.id ? (
                        <div className="flex flex-col gap-1">
                          <input className="border p-2 rounded text-xs font-mono" value={editData.telefono} onChange={e => setEditData({...editData, telefono: e.target.value})} placeholder="Tel" />
                          <input className="border p-2 rounded text-xs" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="Email" />
                          <textarea className="border p-2 rounded text-xs h-16" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} placeholder="Note" />
                        </div>
                      ) : (
                        <div className="max-w-[250px]">
                            <div className="text-xs font-mono font-bold text-gray-700">{c.telefono}</div>
                            <div className="text-[10px] text-gray-400 truncate">{c.email}</div>
                            {c.note && <div className="mt-2 text-[9px] bg-yellow-50 p-2 rounded border border-yellow-100 italic text-gray-600 line-clamp-3">"{c.note}"</div>}
                        </div>
                      )}
                    </td>

                    {/* COLONNA 3: PROVENIENZA */}
                    <td className="p-4 align-top">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{c.azienda_gruppo?.toUpperCase()}</span>
                      <div className="text-[10px] mt-2 text-gray-500 font-bold">{c.fiere?.nome_fiera || 'Fiera N.D.'}</div>
                    </td>

                    {/* COLONNA 4: AZIONI E FOTO */}
                    <td className="p-4 text-center align-top">
                      <div className="flex flex-col items-center gap-3">
                        {editId === c.id ? (
                            <>
                                {c.foto_biglietto_url && (
                                    <div className="p-1 bg-white border rounded shadow-sm">
                                        <img src={c.foto_biglietto_url} className="w-24 h-auto rounded" alt="Biglietto" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        <a href={c.foto_biglietto_url} target="_blank" className="text-[8px] text-blue-600 underline">Apri originale</a>
                                    </div>
                                )}
                                <button onClick={saveEdit} className="bg-blue-600 text-white w-full py-2 rounded-lg text-xs font-bold">SALVA</button>
                                <button onClick={() => setEditId(null)} className="text-gray-400 text-[10px]">Annulla</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => {setEditId(c.id); setEditData(c)}} className="text-gray-400 hover:text-blue-600 text-sm">✏️ Modifica</button>
                                {c.foto_biglietto_url ? (
                                    <a href={c.foto_biglietto_url} target="_blank" className="flex flex-col items-center gap-1">
                                        <img src={c.foto_biglietto_url} className="w-12 h-8 object-cover rounded border shadow-sm" alt="Miniatura" />
                                        <span className="text-[8px] font-bold text-blue-600">VEDI FOTO</span>
                                    </a>
                                ) : <span className="text-[8px] text-gray-300">Senza foto</span>}
                            </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
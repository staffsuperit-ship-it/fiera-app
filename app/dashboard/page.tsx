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
    const { data } = await supabase.from('contatti').select('*, fiere(nome_fiera), operatori(nome)').order('created_at', { ascending: false })
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
    
    if (error) alert("Errore nel salvataggio")
    else { setEditId(null); fetchContatti(); }
  }

  const downloadExcel = () => {
    const dati = contatti.map(c => ({
      Data: new Date(c.created_at).toLocaleDateString(),
      Brand_Stand: c.azienda_gruppo,
      Azienda_Lead: c.azienda_cliente,
      Nome: c.nome, Cognome: c.cognome,
      Tel: c.telefono, Email: c.email, Note: c.note,
      Fiera: c.fiere?.nome_fiera, Operatore: c.operatori?.nome
    }))
    const ws = XLSX.utils.json_to_sheet(dati); const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Contatti"); XLSX.writeFile(wb, "Report_Fiere.xlsx")
  }

  return (
    <main className="p-4 md:p-8 text-black min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">Report Lead</h1>
          <button onClick={downloadExcel} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all">EXCEL</button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase">Lead / Azienda</th>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase">Contatti / Note</th>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase">Stand / Fiera</th>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contatti.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-5">
                      {editId === c.id ? (
                        <div className="space-y-2">
                          <input className="border p-2 w-full rounded-lg text-xs" placeholder="Nome" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} />
                          <input className="border p-2 w-full rounded-lg text-xs" placeholder="Cognome" value={editData.cognome} onChange={e => setEditData({...editData, cognome: e.target.value})} />
                          <input className="border p-2 w-full rounded-lg text-xs font-bold" placeholder="Azienda" value={editData.azienda_cliente} onChange={e => setEditData({...editData, azienda_cliente: e.target.value})} />
                        </div>
                      ) : (
                        <div>
                            <div className="font-black text-blue-900">{c.nome} {c.cognome}</div>
                            <div className="text-xs font-bold text-gray-500">{c.azienda_cliente || 'Nessuna Azienda'}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {editId === c.id ? (
                        <div className="space-y-2">
                          <input className="border p-2 w-full rounded-lg text-xs" placeholder="Tel" value={editData.telefono} onChange={e => setEditData({...editData, telefono: e.target.value})} />
                          <input className="border p-2 w-full rounded-lg text-xs" placeholder="Email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                          <textarea className="border p-2 w-full rounded-lg text-xs h-16" placeholder="Note" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} />
                        </div>
                      ) : (
                        <div>
                            <div className="text-xs font-mono">{c.telefono}</div>
                            <div className="text-[10px] text-gray-400">{c.email}</div>
                            {c.note && <div className="mt-2 text-[10px] bg-yellow-50 p-2 rounded border border-yellow-100 italic text-gray-600">"{c.note}"</div>}
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{c.azienda_gruppo?.toUpperCase()}</span>
                      <div className="text-[10px] mt-2 text-gray-400 font-bold">{c.fiere?.nome_fiera}</div>
                      <div className="text-[9px] text-gray-300 italic">Op: {c.operatori?.nome}</div>
                    </td>
                    <td className="p-5 text-center">
                      {editId === c.id ? (
                        <div className="flex flex-col gap-2">
                            <button onClick={saveEdit} className="bg-blue-600 text-white py-2 rounded-lg text-xs font-bold shadow">SALVA</button>
                            <button onClick={() => setEditId(null)} className="text-gray-400 text-xs">Annulla</button>
                        </div>
                      ) : (
                        <button onClick={() => {setEditId(c.id); setEditData(c)}} className="p-2 hover:bg-gray-100 rounded-full transition-all">✏️</button>
                      )}
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
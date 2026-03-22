'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function Dashboard() {
  const [contatti, setContatti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [mostraArchiviati, setMostraArchiviati] = useState(false)

  const fetchContatti = async () => {
    setLoading(true)
    const { data } = await supabase.from('contatti').select('*, fiere(nome_fiera), operatori(nome)').order('created_at', { ascending: false })
    if (data) setContatti(data)
    setLoading(false)
  }

  useEffect(() => { fetchContatti() }, [])

  const saveEdit = async () => {
    await supabase.from('contatti').update({ 
      nome: editData.nome, cognome: editData.cognome, azienda_cliente: editData.azienda_cliente, 
      telefono: editData.telefono, email: editData.email, note: editData.note 
    }).eq('id', editId)
    setEditId(null); fetchContatti();
  }

  const toggleArchivio = async (id: string, statoAttuale: boolean) => {
    await supabase.from('contatti').update({ archiviato: !statoAttuale }).eq('id', id)
    fetchContatti()
  }

  const contattiFiltrati = mostraArchiviati ? contatti : contatti.filter(c => !c.archiviato)

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black italic tracking-tighter text-gray-800 underline decoration-blue-500 decoration-4">REPORT <span className="text-blue-600">LEAD</span></h1>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setMostraArchiviati(!mostraArchiviati)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black transition-all ${mostraArchiviati ? 'bg-blue-600 text-white' : 'bg-white border text-gray-400'}`}
            >
              {mostraArchiviati ? '📦 VEDI ATTIVI' : '📂 VEDI ARCHIVIO'}
            </button>
            <button onClick={() => {
              const datiExcel = contattiFiltrati.map(c => ({ Data: new Date(c.created_at).toLocaleDateString(), Azienda_Stand: c.azienda_gruppo, Lead: `${c.nome} ${c.cognome}`, Azienda_Lead: c.azienda_cliente, Tel: c.telefono, Fiera: c.fiere?.nome_fiera }))
              const ws = XLSX.utils.json_to_sheet(datiExcel); const wb = XLSX.utils.book_new()
              XLSX.utils.book_append_sheet(wb, ws, "Lead"); XLSX.writeFile(wb, "Report_Lead_Fiera.xlsx")
            }} className="flex-1 md:flex-none bg-green-600 text-white px-8 py-3 rounded-xl font-black shadow-lg">EXCEL</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">CARICAMENTO DATI...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {contattiFiltrati.length === 0 && <div className="text-center py-20 text-gray-300 italic">Nessun lead trovato in questa sezione.</div>}
            {contattiFiltrati.map(c => (
              <div key={c.id} className={`bg-white rounded-3xl shadow-sm border p-6 relative transition-all ${c.archiviato ? 'opacity-60 grayscale' : 'border-gray-100 hover:shadow-md'}`}>
                
                <div className={`absolute top-0 right-0 px-5 py-1.5 text-[10px] font-black rounded-bl-2xl text-white ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {c.azienda_gruppo?.toUpperCase()}
                </div>

                {editId === c.id ? (
                  <div className="space-y-3 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border p-4 rounded-2xl text-sm" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} placeholder="Nome" />
                      <input className="border p-4 rounded-2xl text-sm" value={editData.cognome} onChange={e => setEditData({...editData, cognome: e.target.value})} placeholder="Cognome" />
                    </div>
                    <input className="border p-4 w-full rounded-2xl text-sm font-bold" value={editData.azienda_cliente} onChange={e => setEditData({...editData, azienda_cliente: e.target.value})} placeholder="Azienda" />
                    <input className="border p-4 w-full rounded-2xl text-sm" value={editData.telefono} onChange={e => setEditData({...editData, telefono: e.target.value})} placeholder="Telefono" />
                    <textarea className="border p-4 w-full rounded-2xl text-sm h-24" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} placeholder="Note" />
                    <button onClick={saveEdit} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black">SALVA MODIFICHE</button>
                    <button onClick={() => setEditId(null)} className="w-full text-gray-400 text-xs font-bold">ANNULLA</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-2xl font-black text-gray-800 leading-none mb-1">{c.nome} {c.cognome}</div>
                      <div className="text-xs font-black text-blue-500 uppercase tracking-tighter">{c.azienda_cliente || 'Privato'}</div>
                    </div>

                    <div className="grid grid-cols-2 text-xs text-gray-500 font-bold border-y py-3 border-gray-50">
                      <div>TEL: <span className="text-black font-mono">{c.telefono}</span></div>
                      <div className="truncate text-right uppercase">FIERA: <span className="text-black">{c.fiere?.nome_fiera}</span></div>
                    </div>

                    {c.note && (
                      <div className="bg-blue-50/50 p-4 rounded-2xl text-[11px] text-gray-600 italic border border-blue-100/50">
                        "{c.note}"
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-4">
                        <button onClick={() => {setEditId(c.id); setEditData(c)}} className="text-gray-400 text-[10px] font-black hover:text-blue-600">✏️ EDIT</button>
                        <button onClick={() => toggleArchivio(c.id, c.archiviato)} className="text-gray-400 text-[10px] font-black hover:text-yellow-600">
                          {c.archiviato ? '♻️ RIPRISTINA' : '📦 ARCHIVIA'}
                        </button>
                      </div>
                      
                      {c.foto_biglietto_url && (
                        <a href={c.foto_biglietto_url} target="_blank" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-md">
                          📸 VEDI FOTO
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
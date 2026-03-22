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
          <h1 className="text-3xl font-black italic text-gray-800">REPORT <span className="text-blue-600">LEAD</span></h1>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setMostraArchiviati(!mostraArchiviati)} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black transition-all ${mostraArchiviati ? 'bg-blue-600 text-white' : 'bg-white border text-gray-400'}`}>
              {mostraArchiviati ? '📦 VEDI ATTIVI' : '📂 VEDI ARCHIVIO'}
            </button>
            <button onClick={() => {
              const dati = contattiFiltrati.map(c => ({ Data: new Date(c.created_at).toLocaleDateString(), Stand: c.azienda_gruppo, Lead: `${c.nome} ${c.cognome}`, Azienda: c.azienda_cliente, Tel: c.telefono, Note: c.note }))
              const ws = XLSX.utils.json_to_sheet(dati); const wb = XLSX.utils.book_new()
              XLSX.utils.book_append_sheet(wb, ws, "Lead"); XLSX.writeFile(wb, "Report_Lead.xlsx")
            }} className="flex-1 md:flex-none bg-green-600 text-white px-8 py-3 rounded-xl font-black shadow-lg">EXCEL</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {contattiFiltrati.map(c => (
            <div key={c.id} className={`bg-white rounded-3xl shadow-sm border p-6 relative transition-all ${c.archiviato ? 'opacity-50 grayscale' : 'border-gray-100'}`}>
              <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-black rounded-bl-xl text-white ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-600' : 'bg-green-600'}`}>
                {c.azienda_gruppo?.toUpperCase()}
              </div>

              {editId === c.id ? (
                <div className="space-y-3 pt-4">
                  <input className="border p-3 w-full rounded-xl text-xs" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} placeholder="Nome" />
                  <input className="border p-3 w-full rounded-xl text-xs" value={editData.cognome} onChange={e => setEditData({...editData, cognome: e.target.value})} placeholder="Cognome" />
                  <input className="border p-3 w-full rounded-xl text-xs font-bold" value={editData.azienda_cliente} onChange={e => setEditData({...editData, azienda_cliente: e.target.value})} placeholder="Azienda" />
                  <textarea className="border p-3 w-full rounded-xl text-xs h-24" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} placeholder="Note" />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">SALVA</button>
                    <button onClick={() => setEditId(null)} className="px-4 bg-gray-100 rounded-xl text-xs font-bold text-gray-400">X</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="pt-2">
                    <div className="text-xl font-black text-gray-800 leading-tight">{c.nome} {c.cognome}</div>
                    <div className="text-xs font-black text-blue-500 uppercase">{c.azienda_cliente || 'Privato'}</div>
                  </div>
                  <div className="text-xs text-gray-500 font-bold border-y py-3 border-gray-50 flex justify-between uppercase">
                    <span>TEL: {c.telefono}</span>
                    <span>FIERA: {c.fiere?.nome_fiera}</span>
                  </div>
                  {c.note && <div className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-600 italic">"{c.note}"</div>}
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => {setEditId(c.id); setEditData(c)}} className="text-gray-300 text-[10px] font-black hover:text-blue-600 uppercase">✏️ Modifica</button>
                    <button onClick={() => toggleArchivio(c.id, c.archiviato)} className="text-gray-300 text-[10px] font-black hover:text-orange-600 uppercase">
                      {c.archiviato ? '♻️ Ripristina' : '📦 Archivia'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
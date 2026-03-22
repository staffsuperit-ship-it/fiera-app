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
    await supabase.from('contatti').update({ 
      nome: editData.nome, cognome: editData.cognome, azienda_cliente: editData.azienda_cliente, 
      telefono: editData.telefono, email: editData.email, note: editData.note 
    }).eq('id', editId)
    setEditId(null); fetchContatti();
  }

  return (
    <main className="p-4 md:p-8 bg-gray-100 min-h-screen text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black italic">REPORT <span className="text-blue-600">LEAD</span></h1>
          <button onClick={() => {
            const dati = contatti.map(c => ({ Data: new Date(c.created_at).toLocaleDateString(), Nome: c.nome, Cognome: c.cognome, Azienda: c.azienda_cliente, Tel: c.telefono, Fiera: c.fiere?.nome_fiera }))
            const ws = XLSX.utils.json_to_sheet(dati); const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Lead"); XLSX.writeFile(wb, "Report_Lead.xlsx")
          }} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md">EXCEL</button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Caricamento...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {contatti.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                
                {/* Badge Azienda Gruppo (Angolo) */}
                <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-black rounded-bl-xl text-white ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {c.azienda_gruppo?.toUpperCase()}
                </div>

                {editId === c.id ? (
                  /* MODALITÀ MODIFICA (Card con campi verticali) */
                  <div className="space-y-3 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border p-3 rounded-xl text-xs" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} placeholder="Nome" />
                      <input className="border p-3 rounded-xl text-xs" value={editData.cognome} onChange={e => setEditData({...editData, cognome: e.target.value})} placeholder="Cognome" />
                    </div>
                    <input className="border p-3 w-full rounded-xl text-xs font-bold" value={editData.azienda_cliente} onChange={e => setEditData({...editData, azienda_cliente: e.target.value})} placeholder="Azienda Lead" />
                    <input className="border p-3 w-full rounded-xl text-xs" value={editData.telefono} onChange={e => setEditData({...editData, telefono: e.target.value})} placeholder="Telefono" />
                    <textarea className="border p-3 w-full rounded-xl text-xs h-20" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} placeholder="Note" />
                    
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm">SALVA</button>
                      <button onClick={() => setEditId(null)} className="px-4 bg-gray-100 rounded-xl text-xs font-bold">ANNULLA</button>
                    </div>
                  </div>
                ) : (
                  /* MODALITÀ VISUALIZZAZIONE (Card pulita) */
                  <div className="flex flex-col gap-3">
                    <div className="pt-2">
                      <div className="text-lg font-black text-blue-900 leading-tight">{c.nome} {c.cognome}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{c.azienda_cliente || 'Privato'}</div>
                    </div>

                    <div className="grid grid-cols-2 text-xs border-t border-gray-50 pt-3 gap-2">
                      <div><span className="text-gray-400 font-bold">TEL:</span> {c.telefono}</div>
                      <div className="truncate"><span className="text-gray-400 font-bold">FIERA:</span> {c.fiere?.nome_fiera}</div>
                    </div>

                    {c.note && (
                      <div className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-600 italic">"{c.note}"</div>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-50">
                      <button onClick={() => {setEditId(c.id); setEditData(c)}} className="text-blue-600 text-xs font-bold flex items-center gap-1">✏️ MODIFICA</button>
                      
                      {c.foto_biglietto_url && (
                        <a href={c.foto_biglietto_url} target="_blank" className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black border border-blue-100">
                          📸 VEDI BIGLIETTO
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
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
    await supabase.from('contatti').update({ nome: editData.nome, cognome: editData.cognome, azienda_cliente: editData.azienda_cliente, note: editData.note }).eq('id', editId)
    setEditId(null); fetchContatti();
  }

  const downloadExcel = () => {
    const dati = contatti.map(c => ({
      Data: new Date(c.created_at).toLocaleDateString(),
      Azienda_Lead: c.azienda_cliente,
      Nome: c.nome, Cognome: c.cognome,
      Tel: c.telefono, Email: c.email, Note: c.note,
      Fiera: c.fiere?.nome_fiera, Operatore: c.operatori?.nome
    }))
    const ws = XLSX.utils.json_to_sheet(dati); const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Contatti"); XLSX.writeFile(wb, "Report_Fiere.xlsx")
  }

  return (
    <main className="p-4 md:p-8 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">Report Lead</h1>
          <button onClick={downloadExcel} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">EXCEL</button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-gray-400">LEAD</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400">NOTE / INFO</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400">AZIENDA/FIERA</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400">AZIONI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contatti.map(c => (
                  <tr key={c.id} className="text-sm">
                    <td className="p-4">
                      {editId === c.id ? (
                        <div className="space-y-1">
                          <input className="border p-1 w-full" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} />
                          <input className="border p-1 w-full" value={editData.cognome} onChange={e => setEditData({...editData, cognome: e.target.value})} />
                        </div>
                      ) : (
                        <div><div className="font-bold">{c.nome} {c.cognome}</div><div className="text-xs text-gray-500">{c.azienda_cliente}</div></div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs">{c.telefono}</div>
                      <div className="text-[10px] text-gray-400 italic max-w-xs">{c.note}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{c.azienda_gruppo}</span>
                      <div className="text-[10px] mt-1 text-gray-400">{c.fiere?.nome_fiera}</div>
                    </td>
                    <td className="p-4 text-center">
                      {editId === c.id ? <button onClick={saveEdit} className="text-blue-600 font-bold">SALVA</button> : <button onClick={() => {setEditId(c.id); setEditData(c)}} className="text-gray-400">✏️</button>}
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
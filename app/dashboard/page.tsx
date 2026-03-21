'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function Dashboard() {
  const [contatti, setContatti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Stato per la modifica
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)

  const fetchContatti = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contatti')
      .select(`
        *,
        fiere ( nome_fiera ),
        operatori ( nome, cognome )
      `)
      .order('created_at', { ascending: false })

    if (data) setContatti(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchContatti()
  }, [])

  // Inizia modifica
  const handleEdit = (contatto: any) => {
    setEditId(contatto.id)
    setEditData({ ...contatto })
  }

  // Salva modifica
  const saveEdit = async () => {
    const { error } = await supabase
      .from('contatti')
      .update({
        nome: editData.nome,
        cognome: editData.cognome,
        email: editData.email,
        telefono: editData.telefono
      })
      .eq('id', editId)

    if (error) {
      alert("Errore durante l'aggiornamento")
    } else {
      setEditId(null)
      fetchContatti()
    }
  }

  const downloadExcel = () => {
    const datiFormattati = contatti.map(c => ({
      Data: new Date(c.created_at).toLocaleString(),
      Azienda: c.azienda_gruppo,
      Nome: c.nome,
      Cognome: c.cognome,
      Telefono: c.telefono,
      Email: c.email,
      Lingua: c.lingua,
      Fiera: c.fiere?.nome_fiera || 'N/A',
      Operatore: `${c.operatori?.nome || ''} ${c.operatori?.cognome || ''}`,
      Foto: c.foto_biglietto_url || 'Nessuna'
    }))

    const ws = XLSX.utils.json_to_sheet(datiFormattati)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Contatti Fiera")
    XLSX.writeFile(wb, "Report_Contatti_Fiera.xlsx")
  }

  return (
    <main className="p-4 md:p-8 bg-gray-100 min-h-screen text-black">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Report Contatti</h1>
            <p className="text-gray-500 text-sm">Visualizza e scarica i lead acquisiti</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <button onClick={fetchContatti} className="flex-1 md:flex-none bg-white px-6 py-3 rounded-xl shadow-sm font-bold text-gray-600 border border-gray-200">🔄 Aggiorna</button>
             <button onClick={downloadExcel} className="flex-1 md:flex-none bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg font-black tracking-wide">📊 EXCEL</button>
          </div>
        </div>

        {/* CONTENITORE TABELLA CON SCROLL PER MOBILE */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase">Data/Fiera</th>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase">Azienda</th>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase">Contatto</th>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase">Foto</th>
                  <th className="p-5 text-[10px] font-bold text-gray-400 uppercase text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 italic">Recupero contatti in corso...</td></tr>
                ) : contatti.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-5">
                      <div className="text-xs font-bold">{new Date(c.created_at).toLocaleDateString()}</div>
                      <div className="text-[10px] text-blue-600 font-medium">{c.fiere?.nome_fiera}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {c.azienda_gruppo?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5">
                      {editId === c.id ? (
                        <div className="space-y-1">
                          <input className="border p-1 text-xs w-full rounded" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} />
                          <input className="border p-1 text-xs w-full rounded" value={editData.cognome} onChange={e => setEditData({...editData, cognome: e.target.value})} />
                          <input className="border p-1 text-xs w-full rounded" value={editData.telefono} onChange={e => setEditData({...editData, telefono: e.target.value})} />
                        </div>
                      ) : (
                        <>
                          <div className="font-bold text-sm">{c.nome} {c.cognome}</div>
                          <div className="text-xs text-gray-500">{c.telefono}</div>
                          <div className="text-[10px] text-gray-400">{c.email}</div>
                        </>
                      )}
                    </td>
                    <td className="p-5">
                      {c.foto_biglietto_url ? (
                        <a href={c.foto_biglietto_url} target="_blank" className="flex items-center gap-1 text-blue-600 font-bold text-[10px] hover:underline">
                          🖼️ VEDI FOTO
                        </a>
                      ) : <span className="text-gray-300 text-[10px]">No foto</span>}
                    </td>
                    <td className="p-5 text-center">
                      {editId === c.id ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Salva</button>
                          <button onClick={() => setEditId(null)} className="bg-gray-200 px-3 py-1 rounded text-xs text-gray-600">X</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-blue-600 transition-colors">
                          ✏️ Modifica
                        </button>
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
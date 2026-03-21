'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function Dashboard() {
  const [contatti, setContatti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Carica i contatti dal DB
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

  // Funzione per scaricare l'Excel
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
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestione Contatti</h1>
          <div className="space-x-2">
             <button onClick={fetchContatti} className="bg-white px-4 py-2 rounded-lg shadow text-gray-600">Aggiorna</button>
             <button onClick={downloadExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow font-bold">Scarica Excel</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Azienda</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Contatto</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Fiera/Op</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y text-black">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center">Caricamento in corso...</td></tr>
              ) : contatti.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${c.azienda_gruppo === 'Todde Bus' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {c.azienda_gruppo}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{c.nome} {c.cognome}</div>
                    <div className="text-xs text-gray-500">{c.telefono}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div>{c.fiere?.nome_fiera}</div>
                    <div className="text-xs italic text-gray-400">da: {c.operatori?.nome}</div>
                  </td>
                  <td className="p-4">
                    {c.foto_biglietto_url ? (
                      <a href={c.foto_biglietto_url} target="_blank" className="text-blue-600 text-xs underline">Vedi Foto</a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
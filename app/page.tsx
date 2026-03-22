'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [listaFiere, setListaFiere] = useState<any[]>([])
  const [listaOperatori, setListaOperatori] = useState<any[]>([])
  const [azienda, setAzienda] = useState('Todde Bus')
  const [fieraId, setFieraId] = useState('')
  const [operatoreId, setOperatoreId] = useState('')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [aziendaCliente, setAziendaCliente] = useState('') // NUOVO
  const [telefono, setTelefono] = useState('+39')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('') // NUOVO
  const [lingua, setLingua] = useState('it')
  const [fileFoto, setFileFoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchDati() {
      const { data: f } = await supabase.from('fiere').select('*').eq('attiva', true)
      if (f) { setListaFiere(f); if (f.length > 0) setFieraId(f[0].id) }
      const { data: o } = await supabase.from('operatori').select('*').eq('attivo', true)
      if (o) setListaOperatori(o)
    }
    fetchDati()
  }, [])

  const salvaContatto = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let fotoUrl = null

    if (fileFoto) {
      const fileName = `${Math.random()}.jpg`
      const { data: upData } = await supabase.storage.from('biglietti-visita').upload(fileName, fileFoto)
      if (upData) {
        const { data } = supabase.storage.from('biglietti-visita').getPublicUrl(fileName)
        fotoUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('contatti').insert([{ 
      nome, cognome, azienda_cliente: aziendaCliente, telefono, email, note, 
      azienda_gruppo: azienda, fiera_id: fieraId, operatore_id: operatoreId || null, 
      lingua, foto_biglietto_url: fotoUrl 
    }])

    if (!error) {
      const msg = lingua === 'it' 
        ? `Ciao ${nome}, grazie per averci visitato allo stand ${azienda}! Scarica il catalogo: https://tuolink.it`
        : `Hi ${nome}, thanks for visiting ${azienda}! Download our catalog: https://yourlink.com`
      window.open(`https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
      setNome(''); setCognome(''); setAziendaCliente(''); setTelefono('+39'); setEmail(''); setNote(''); setFileFoto(null);
      alert("Salvato!")
    }
    setLoading(false)
  }

  return (
    <main className="p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex bg-gray-100 rounded-xl p-1.5 mb-6">
          <button onClick={() => setAzienda('Todde Bus')} className={`flex-1 py-3 text-sm font-bold rounded-lg ${azienda === 'Todde Bus' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}>Todde Bus</button>
          <button onClick={() => setAzienda('Mt Explore')} className={`flex-1 py-3 text-sm font-bold rounded-lg ${azienda === 'Mt Explore' ? 'bg-white text-green-600 shadow' : 'text-gray-500'}`}>Mt Explore</button>
        </div>

        <form onSubmit={salvaContatto} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <select value={fieraId} onChange={e => setFieraId(e.target.value)} className="p-2 bg-gray-50 border rounded text-xs text-black">
              {listaFiere.map(f => <option key={f.id} value={f.id}>{f.nome_fiera}</option>)}
            </select>
            <select value={operatoreId} onChange={e => setOperatoreId(e.target.value)} className="p-2 bg-gray-50 border rounded text-xs text-black">
              <option value="">Operatore?</option>
              {listaOperatori.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setLingua('it')} className={`flex-1 py-2 rounded border text-xs font-bold ${lingua === 'it' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white text-gray-400'}`}>🇮🇹 ITA</button>
            <button type="button" onClick={() => setLingua('en')} className={`flex-1 py-2 rounded border text-xs font-bold ${lingua === 'en' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white text-gray-400'}`}>🇬🇧 ENG</button>
          </div>

          <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black" />
          <input type="text" placeholder="Cognome" value={cognome} onChange={e => setCognome(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black" />
          <input type="text" placeholder="Azienda del contatto" value={aziendaCliente} onChange={e => setAziendaCliente(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl text-black" />
          <input type="tel" placeholder="Cellulare" value={telefono} onChange={e => setTelefono(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl text-black" />
          <textarea placeholder="Note / Interessi" value={note} onChange={e => setNote(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl text-black h-20" />

          <label className="block w-full text-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer">
            <span className="text-sm text-gray-600 font-medium">{fileFoto ? "📸 Foto Pronta" : "📷 Scatta foto biglietto"}</span>
            <input type="file" accept="image/*" capture="environment" onChange={e => setFileFoto(e.target.files ? e.target.files[0] : null)} className="hidden" />
          </label>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-xl font-black text-white ${azienda === 'Todde Bus' ? 'bg-blue-600' : 'bg-green-600'}`}>
            {loading ? 'SALVATAGGIO...' : 'SALVA E INVIA WHATSAPP'}
          </button>
        </form>
      </div>
    </main>
  )
}
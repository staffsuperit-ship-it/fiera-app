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
  const [aziendaCliente, setAziendaCliente] = useState('')
  const [telefono, setTelefono] = useState('+39')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
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

    // --- QUI MODIFICHI I LINK WHATSAPP ---
    const linkToddeBus = "https://www.graficapubblicita.com/catalogo-todde" // <--- CAMBIA QUI
    const linkMtExplore = "https://www.graficapubblicita.com/catalogo-mt"  // <--- CAMBIA QUI
    // -------------------------------------

    let fotoUrl = null

    if (fileFoto) {
      // Usiamo il timestamp per rendere il file unico ed evitare errori di visualizzazione
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      const { data: upData, error: upError } = await supabase.storage
        .from('biglietti-visita')
        .upload(fileName, fileFoto)
      
      if (upData) {
        const { data: publicUrlData } = supabase.storage.from('biglietti-visita').getPublicUrl(fileName)
        fotoUrl = publicUrlData.publicUrl
      }
    }

    const { error } = await supabase.from('contatti').insert([{ 
      nome, cognome, azienda_cliente: aziendaCliente, telefono, email, note, 
      azienda_gruppo: azienda, fiera_id: fieraId, operatore_id: operatoreId || null, 
      lingua, foto_biglietto_url: fotoUrl 
    }])

    if (!error) {
      const linkScelto = azienda === 'Todde Bus' ? linkToddeBus : linkMtExplore
      const msg = lingua === 'it' 
        ? `Ciao ${nome}, grazie per averci visitato allo stand ${azienda}! Scarica il catalogo qui: ${linkScelto}`
        : `Hi ${nome}, thanks for visiting ${azienda} booth! Download our catalog here: ${linkScelto}`
      
      window.open(`https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
      
      setNome(''); setCognome(''); setAziendaCliente(''); setTelefono('+39'); setEmail(''); setNote(''); setFileFoto(null);
      alert("Contatto Registrato!")
    } else {
      alert("Errore: " + error.message)
    }
    setLoading(false)
  }

  return (
    <main className="p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex bg-gray-100 rounded-xl p-1.5 mb-6">
          <button onClick={() => setAzienda('Todde Bus')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${azienda === 'Todde Bus' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>Todde Bus</button>
          <button onClick={() => setAzienda('Mt Explore')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${azienda === 'Mt Explore' ? 'bg-white text-green-600 shadow-md' : 'text-gray-400'}`}>Mt Explore</button>
        </div>

        <form onSubmit={salvaContatto} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-black">
            <select value={fieraId} onChange={e => setFieraId(e.target.value)} className="p-2 bg-gray-50 border rounded-lg text-xs">
              {listaFiere.map(f => <option key={f.id} value={f.id}>{f.nome_fiera}</option>)}
            </select>
            <select value={operatoreId} onChange={e => setOperatoreId(e.target.value)} className="p-2 bg-gray-50 border rounded-lg text-xs">
              <option value="">Operatore?</option>
              {listaOperatori.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setLingua('it')} className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${lingua === 'it' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>🇮🇹 ITA</button>
            <button type="button" onClick={() => setLingua('en')} className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${lingua === 'en' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>🇬🇧 ENG</button>
          </div>

          <div className="space-y-3">
            <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Cognome" value={cognome} onChange={e => setCognome(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Ragione Sociale Cliente" value={aziendaCliente} onChange={e => setAziendaCliente(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="tel" placeholder="Cellulare" value={telefono} onChange={e => setTelefono(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="email" placeholder="Email (facoltativa)" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" />
            <textarea placeholder="Note e interessi particolari..." value={note} onChange={e => setNote(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl text-black h-24 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <label className="block w-full text-center p-5 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
            <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">
              {fileFoto ? `📸 ${fileFoto.name.substring(0, 15)}...` : "📷 FOTO BIGLIETTO"}
            </span>
            <input type="file" accept="image/*" capture="environment" onChange={e => setFileFoto(e.target.files ? e.target.files[0] : null)} className="hidden" />
          </label>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transform active:scale-95 transition-all ${azienda === 'Todde Bus' ? 'bg-blue-600' : 'bg-green-600'}`}>
            {loading ? 'ELABORAZIONE...' : 'REGISTRA E WHATSAPP'}
          </button>
        </form>
      </div>
    </main>
  )
}
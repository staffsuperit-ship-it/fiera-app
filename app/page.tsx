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
  const [telefono, setTelefono] = useState('+39') // Prefisso preimpostato
  const [email, setEmail] = useState('')
  const [lingua, setLingua] = useState('it')
  const [fileFoto, setFileFoto] = useState<File | null>(null) // Per la foto
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchDati() {
      const { data: fiere } = await supabase.from('fiere').select('*').eq('attiva', true)
      if (fiere) {
        setListaFiere(fiere)
        if (fiere.length > 0) setFieraId(fiere[0].id)
      }
      const { data: ops } = await supabase.from('operatori').select('*').eq('attivo', true)
      if (ops) setListaOperatori(ops)
    }
    fetchDati()
  }, [])

  const salvaContatto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fieraId) return alert("Seleziona una fiera!")
    setLoading(true)

    let fotoUrl = null

    // GESTIONE CARICAMENTO FOTO (se presente)
    if (fileFoto) {
      const fileExt = fileFoto.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('biglietti-visita')
        .upload(fileName, fileFoto)

      if (uploadError) {
        alert("Errore caricamento foto: " + uploadError.message)
      } else {
        // Otteniamo l'URL pubblico della foto
        const { data } = supabase.storage.from('biglietti-visita').getPublicUrl(fileName)
        fotoUrl = data.publicUrl
      }
    }

    // SALVATAGGIO NEL DB
    const { error } = await supabase
      .from('contatti')
      .insert([
        { 
          nome, 
          cognome, 
          telefono, 
          email, 
          azienda_gruppo: azienda,
          fiera_id: fieraId,
          operatore_id: operatoreId || null,
          lingua,
          foto_biglietto_url: fotoUrl // Salviamo il link della foto
        }
      ])

    if (error) {
      alert("Errore salvataggio: " + error.message)
    } else {
      const msg = lingua === 'it' 
        ? `Ciao ${nome}, grazie per averci visitato allo stand ${azienda}! Ecco il catalogo: https://tuolink.it`
        : `Hi ${nome}, thanks for visiting ${azienda}! Here is our catalog: https://yourlink.com`
      
      const waUrl = `https://wa.me/${telefono.replace('+', '').replace(/ /g, '')}?text=${encodeURIComponent(msg)}`
      alert("Contatto salvato con successo!")
      window.open(waUrl, '_blank')
      
      // Reset dei campi
      setNome(''); setCognome(''); setTelefono('+39'); setEmail(''); setFileFoto(null);
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        
        {/* SWITCH AZIENDA */}
        <div className="flex bg-gray-100 rounded-xl p-1.5 mb-6">
          <button onClick={() => setAzienda('Todde Bus')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${azienda === 'Todde Bus' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500'}`}>
            Todde Bus
          </button>
          <button onClick={() => setAzienda('Mt Explore')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${azienda === 'Mt Explore' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500'}`}>
            Mt Explore
          </button>
        </div>

        <form onSubmit={salvaContatto} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Fiera</label>
              <select value={fieraId} onChange={(e) => setFieraId(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg text-sm text-black">
                {listaFiere.map(f => <option key={f.id} value={f.id}>{f.nome_fiera}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Operatore</label>
              <select value={operatoreId} onChange={(e) => setOperatoreId(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg text-sm text-black">
                <option value="">Chi sei?</option>
                {listaOperatori.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-2" />

          {/* LINGUA */}
          <div className="flex justify-center gap-2">
            <button type="button" onClick={() => setLingua('it')} className={`flex-1 py-2 rounded-lg border text-xs font-bold ${lingua === 'it' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white text-gray-400'}`}>🇮🇹 ITA</button>
            <button type="button" onClick={() => setLingua('en')} className={`flex-1 py-2 rounded-lg border text-xs font-bold ${lingua === 'en' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white text-gray-400'}`}>🇬🇧 ENG</button>
          </div>

          <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black" />
          <input type="text" placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} required className="w-full p-4 bg-gray-50 border rounded-xl text-black" />
          
          {/* CAMPO TELEFONO CON ISTRUZIONE */}
          <div className="space-y-1">
            <input 
              type="tel" 
              placeholder="Cellulare" 
              value={telefono} 
              onChange={(e) => setTelefono(e.target.value)} 
              required 
              className="w-full p-4 bg-gray-50 border rounded-xl text-black font-mono" 
            />
            <p className="text-[10px] text-gray-500 ml-2">Usa il formato internazionale (es. +39 340...)</p>
          </div>

          <input type="email" placeholder="Email (opzionale)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl text-black" />

          {/* TASTO FOTO BIGLIETTO DA VISITA */}
          <div className="mt-4">
            <label className="block w-full text-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-600 font-medium">
                {fileFoto ? `📸 Foto caricata: ${fileFoto.name.substring(0, 10)}...` : "📷 Scatta foto biglietto da visita"}
              </span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={(e) => setFileFoto(e.target.files ? e.target.files[0] : null)} 
                className="hidden" 
              />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 rounded-xl font-black text-white shadow-lg transition-transform active:scale-95 ${azienda === 'Todde Bus' ? 'bg-blue-600' : 'bg-green-600'}`}
          >
            {loading ? 'CARICAMENTO IN CORSO...' : 'SALVA E INVIA WHATSAPP'}
          </button>
        </form>
      </div>
    </main>
  )
}
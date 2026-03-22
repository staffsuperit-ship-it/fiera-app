'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [fiere, setFiere] = useState<any[]>([])
  const [operatori, setOperatori] = useState<any[]>([])
  const [nuovaFiera, setNuovaFiera] = useState({ nome: '', luogo: '' })
  const [nuovoOp, setNuovoOp] = useState({ nome: '', cognome: '' })
  
  // Filtro per pulizia visiva (mostra solo attive o tutte)
  const [mostraTutteFiere, setMostraTutteFiere] = useState(false)

  const caricaDati = async () => {
    // Carichiamo tutto senza ordinamenti che potrebbero rompere il codice
    const { data: f } = await supabase.from('fiere').select('*')
    const { data: o } = await supabase.from('operatori').select('*')
    
    if (f) setFiere(f)
    if (o) setOperatori(o)
  }

  useEffect(() => { caricaDati() }, [])

  const aggiungiFiera = async () => {
    if (!nuovaFiera.nome) return
    const { error } = await supabase.from('fiere').insert([{ 
        nome_fiera: nuovaFiera.nome, 
        luogo: nuovaFiera.luogo, 
        attiva: true 
    }])
    if (error) alert("Errore creazione: " + error.message)
    setNuovaFiera({ nome: '', luogo: '' }); caricaDati()
  }

  const aggiungiOperatore = async () => {
    if (!nuovoOp.nome) return
    await supabase.from('operatori').insert([{ nome: nuovoOp.nome, cognome: nuovoOp.cognome, attivo: true }])
    setNuovoOp({ nome: '', cognome: '' }); caricaDati()
  }

  const toggleAttivo = async (tabella: string, id: string, statoAttuale: boolean) => {
    await supabase.from(tabella).update({ [tabella === 'fiere' ? 'attiva' : 'attivo']: !statoAttuale }).eq('id', id)
    caricaDati()
  }

  // Logica Filtro per le Fiere
  const fiereVisibili = mostraTutteFiere ? fiere : fiere.filter(f => f.attiva === true)

  return (
    <main className="p-4 md:p-10 bg-gray-50 min-h-screen text-black">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-4xl font-black text-gray-800">Setup Fiera</h1>
        </div>

        {/* SEZIONE FIERE */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-black flex items-center gap-2 text-blue-600">🌍 Lista Fiere</h2>
            
            <button 
                onClick={() => setMostraTutteFiere(!mostraTutteFiere)}
                className={`text-[10px] font-bold px-4 py-2 rounded-lg transition-all shadow-sm ${mostraTutteFiere ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 border'}`}
            >
                {mostraTutteFiere ? "👁️ NASCONDI ARCHIVIATE" : "📂 MOSTRA ANCHE ARCHIVIATE"}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-8 bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
            <input type="text" placeholder="Nome Evento" value={nuovaFiera.nome} onChange={e => setNuovaFiera({...nuovaFiera, nome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white text-sm" />
            <input type="text" placeholder="Città" value={nuovaFiera.luogo} onChange={e => setNuovaFiera({...nuovaFiera, luogo: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white text-sm" />
            <button onClick={aggiungiFiera} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all text-sm">+ CREA</button>
          </div>

          <div className="space-y-3">
            {fiereVisibili.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl text-sm">
                    Nessuna fiera {mostraTutteFiere ? '' : 'attiva'} trovata.
                </div>
            ) : (
                fiereVisibili.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                    <div className="flex flex-col">
                      <span className={`font-black text-sm ${!f.attiva && 'text-gray-300 italic line-through'}`}>{f.nome_fiera}</span>
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">{f.luogo}</span>
                    </div>
                    <button 
                        onClick={() => toggleAttivo('fiere', f.id, f.attiva)} 
                        className={`text-[9px] px-4 py-2 rounded-full font-black shadow-sm transition-all ${f.attiva ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-500'}`}
                    >
                        {f.attiva ? 'IN CORSO' : 'ARCHIVIATA'}
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* SEZIONE OPERATORI */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-green-600">👥 Operatori Stand</h2>
          <div className="flex flex-col md:flex-row gap-3 mb-8 bg-green-50/30 p-4 rounded-2xl border border-green-50">
            <input type="text" placeholder="Nome" value={nuovoOp.nome} onChange={e => setNuovoOp({...nuovoOp, nome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white text-sm" />
            <input type="text" placeholder="Cognome" value={nuovoOp.cognome} onChange={e => setNuovoOp({...nuovoOp, cognome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white text-sm" />
            <button onClick={aggiungiOperatore} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all text-sm">+ AGGIUNGI</button>
          </div>
          <div className="space-y-3">
            {operatori.map(o => (
              <div key={o.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className={`font-black text-sm ${!o.attivo && 'text-gray-300 italic line-through'}`}>{o.nome} {o.cognome}</span>
                <button onClick={() => toggleAttivo('operatori', o.id, o.attivo)} className={`text-[9px] px-4 py-2 rounded-full font-black shadow-sm transition-all ${o.attivo ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-500'}`}>
                    {o.attivo ? 'ATTIVO' : 'SOSPESO'}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
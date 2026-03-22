'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [fiere, setFiere] = useState<any[]>([])
  const [operatori, setOperatori] = useState<any[]>([])
  const [nuovaFiera, setNuovaFiera] = useState({ nome: '', luogo: '' })
  const [nuovoOp, setNuovoOp] = useState({ nome: '', cognome: '' })
  
  // Filtro per pulizia visiva
  const [mostraTutteFiere, setMostraTutteFiere] = useState(false)

  const caricaDati = async () => {
    const { data: f } = await supabase.from('fiere').select('*').order('created_at', { ascending: false })
    const { data: o } = await supabase.from('operatori').select('*').order('nome')
    if (f) setFiere(f)
    if (o) setOperatori(o)
  }

  useEffect(() => { caricaDati() }, [])

  const aggiungiFiera = async () => {
    if (!nuovaFiera.nome) return
    await supabase.from('fiere').insert([{ nome_fiera: nuovaFiera.nome, luogo: nuovaFiera.luogo, attiva: true }])
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

  const eliminaElemento = async (tabella: string, id: string, nome: string) => {
    const msg = tabella === 'fiere' 
      ? `⚠️ ATTENZIONE: Stai eliminando la fiera "${nome}".\n\nIMPORTANTE: Prima di eliminare definitivamente una fiera, assicurati di aver scaricato il REPORT EXCEL dei contatti collegati!\n\nVuoi procedere comunque?`
      : `Vuoi eliminare definitivamente l'operatore ${nome}?`

    if (confirm(msg)) {
        const { error } = await supabase.from(tabella).delete().eq('id', id)
        if (error) {
            alert("Impossibile eliminare: ci sono già dei contatti registrati per questo elemento. Per pulire l'elenco, usa il tasto 'SPEGNI' (Online/Offline).")
        } else {
            caricaDati()
        }
    }
  }

  // Filtriamo le fiere in base alla scelta (Solo attive o tutte)
  const fiereVisibili = mostraTutteFiere ? fiere : fiere.filter(f => f.attiva)

  return (
    <main className="p-4 md:p-10 bg-gray-50 min-h-screen text-black">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <h1 className="text-4xl font-black text-gray-800">Setup Fiera</h1>

        {/* SEZIONE FIERE */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-black flex items-center gap-2 text-blue-600">🌍 Lista Fiere</h2>
            
            {/* Toggle per pulizia elenco */}
            <button 
                onClick={() => setMostraTutteFiere(!mostraTutteFiere)}
                className="text-[10px] font-bold bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
            >
                {mostraTutteFiere ? "👁️ NASCONDI ARCHIVIATE" : "📂 MOSTRA ANCHE ARCHIVIATE"}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-8 bg-blue-50/30 p-4 rounded-2xl">
            <input type="text" placeholder="Nome Evento" value={nuovaFiera.nome} onChange={e => setNuovaFiera({...nuovaFiera, nome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white" />
            <input type="text" placeholder="Città" value={nuovaFiera.luogo} onChange={e => setNuovaFiera({...nuovaFiera, luogo: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white" />
            <button onClick={aggiungiFiera} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">+ CREA</button>
          </div>

          <div className="space-y-3">
            {fiereVisibili.length === 0 && <div className="text-center py-10 text-gray-400 italic">Nessuna fiera attiva in elenco.</div>}
            {fiereVisibili.map(f => (
              <div key={f.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                <div className="flex flex-col">
                  <span className={`font-black text-sm ${!f.attiva && 'text-gray-400'}`}>{f.nome_fiera}</span>
                  <span className="text-gray-400 text-[10px] uppercase font-bold">{f.luogo}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => toggleAttivo('fiere', f.id, f.attiva)} 
                        className={`text-[9px] px-3 py-1.5 rounded-full font-black ${f.attiva ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                    >
                        {f.attiva ? 'IN CORSO' : 'ARCHIVIATA'}
                    </button>
                    <button onClick={() => eliminaElemento('fiere', f.id, f.nome_fiera)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEZIONE OPERATORI */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-green-600">👥 Operatori Stand</h2>
          <div className="flex flex-col md:flex-row gap-3 mb-8 bg-green-50/30 p-4 rounded-2xl">
            <input type="text" placeholder="Nome" value={nuovoOp.nome} onChange={e => setNuovoOp({...nuovoOp, nome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white" />
            <input type="text" placeholder="Cognome" value={nuovoOp.cognome} onChange={e => setNuovoOp({...nuovoOp, cognome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-white" />
            <button onClick={aggiungiOperatore} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">+ AGGIUNGI</button>
          </div>
          <div className="space-y-3">
            {operatori.map(o => (
              <div key={o.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className={`font-black text-sm ${!o.attivo && 'text-gray-400'}`}>{o.nome} {o.cognome}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => toggleAttivo('operatori', o.id, o.attivo)} className={`text-[9px] px-3 py-1.5 rounded-full font-black ${o.attivo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {o.attivo ? 'ATTIVO' : 'SOSPESO'}
                    </button>
                    <button onClick={() => eliminaElemento('operatori', o.id, o.nome)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
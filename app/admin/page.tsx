'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [fiere, setFiere] = useState<any[]>([])
  const [operatori, setOperatori] = useState<any[]>([])
  const [nuovaFiera, setNuovaFiera] = useState({ nome: '', luogo: '' })
  const [nuovoOp, setNuovoOp] = useState({ nome: '', cognome: '' })

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

  const eliminaElemento = async (tabella: string, id: string) => {
    if (confirm("⚠️ ATTENZIONE: Sei sicuro di voler eliminare definitivamente? Questa operazione non si può annullare.")) {
        const { error } = await supabase.from(tabella).delete().eq('id', id)
        if (error) alert("Non puoi eliminare questo elemento perché è collegato a dei contatti esistenti. Disattivalo invece di eliminarlo.")
        else caricaDati()
    }
  }

  return (
    <main className="p-4 md:p-10 bg-gray-50 min-h-screen text-black">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <h1 className="text-4xl font-black text-gray-800">Setup Fiera</h1>

        {/* FIERE */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-blue-600">🌍 Lista Fiere</h2>
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <input type="text" placeholder="Nome Evento" value={nuovaFiera.nome} onChange={e => setNuovaFiera({...nuovaFiera, nome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-gray-50" />
            <input type="text" placeholder="Città" value={nuovaFiera.luogo} onChange={e => setNuovaFiera({...nuovaFiera, luogo: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-gray-50" />
            <button onClick={aggiungiFiera} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black">+ CREA</button>
          </div>
          <div className="space-y-3">
            {fiere.map(f => (
              <div key={f.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:shadow-md transition-all">
                <div className="flex flex-col">
                  <span className="font-black text-sm">{f.nome_fiera}</span>
                  <span className="text-gray-400 text-[10px] uppercase font-bold">{f.luogo}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => toggleAttivo('fiere', f.id, f.attiva)} className={`text-[10px] px-4 py-2 rounded-full font-black ${f.attiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {f.attiva ? 'ONLINE' : 'OFFLINE'}
                    </button>
                    <button onClick={() => eliminaElemento('fiere', f.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OPERATORI */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-green-600">👥 Operatori Stand</h2>
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <input type="text" placeholder="Nome" value={nuovoOp.nome} onChange={e => setNuovoOp({...nuovoOp, nome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-gray-50" />
            <input type="text" placeholder="Cognome" value={nuovoOp.cognome} onChange={e => setNuovoOp({...nuovoOp, cognome: e.target.value})} className="flex-1 p-4 border rounded-2xl bg-gray-50" />
            <button onClick={aggiungiOperatore} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black">+ AGGIUNGI</button>
          </div>
          <div className="space-y-3">
            {operatori.map(o => (
              <div key={o.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:shadow-md transition-all">
                <span className="font-black text-sm">{o.nome} {o.cognome}</span>
                <div className="flex items-center gap-3">
                    <button onClick={() => toggleAttivo('operatori', o.id, o.attivo)} className={`text-[10px] px-4 py-2 rounded-full font-black ${o.attivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {o.attivo ? 'ATTIVO' : 'SOSPESO'}
                    </button>
                    <button onClick={() => eliminaElemento('operatori', o.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
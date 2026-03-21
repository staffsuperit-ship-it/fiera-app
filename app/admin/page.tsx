'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
    setNuovaFiera({ nome: '', luogo: '' })
    caricaDati()
  }

  const aggiungiOperatore = async () => {
    if (!nuovoOp.nome) return
    await supabase.from('operatori').insert([{ nome: nuovoOp.nome, cognome: nuovoOp.cognome, attivo: true }])
    setNuovoOp({ nome: '', cognome: '' })
    caricaDati()
  }

  const toggleAttivo = async (tabella: string, id: string, statoAttuale: boolean) => {
    await supabase.from(tabella).update({ [tabella === 'fiere' ? 'attiva' : 'attivo']: !statoAttuale }).eq('id', id)
    caricaDati()
  }

  return (
    <main className="p-4 md:p-6 bg-gray-50 min-h-screen text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">Pannello Gestione</h1>
            <Link href="/dashboard" className="text-blue-600 underline text-sm">Vedi Report Contatti →</Link>
        </div>

        {/* GESTIONE FIERE */}
        <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🌍 Gestione Fiere</h2>
          {/* Layout responsivo: colonna su mobile, riga su desktop */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input type="text" placeholder="Nome Fiera" value={nuovaFiera.nome} onChange={e => setNuovaFiera({...nuovaFiera, nome: e.target.value})} className="flex-1 p-3 border rounded-xl text-sm" />
            <input type="text" placeholder="Luogo" value={nuovaFiera.luogo} onChange={e => setNuovaFiera({...nuovaFiera, luogo: e.target.value})} className="flex-1 p-3 border rounded-xl text-sm" />
            <button onClick={aggiungiFiera} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm">+ Aggiungi</button>
          </div>
          <div className="space-y-2">
            {fiere.map(f => (
              <div key={f.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{f.nome_fiera}</span>
                  <span className="text-gray-400 text-xs">{f.luogo}</span>
                </div>
                <button onClick={() => toggleAttivo('fiere', f.id, f.attiva)} className={`text-[10px] px-3 py-1.5 rounded-full font-bold shadow-sm ${f.attiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {f.attiva ? 'ATTIVA' : 'DISATTIVATA'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* GESTIONE OPERATORI */}
        <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">👥 Gestione Operatori</h2>
          {/* Layout responsivo: colonna su mobile, riga su desktop */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input type="text" placeholder="Nome" value={nuovoOp.nome} onChange={e => setNuovoOp({...nuovoOp, nome: e.target.value})} className="flex-1 p-3 border rounded-xl text-sm" />
            <input type="text" placeholder="Cognome" value={nuovoOp.cognome} onChange={e => setNuovoOp({...nuovoOp, cognome: e.target.value})} className="flex-1 p-3 border rounded-xl text-sm" />
            <button onClick={aggiungiOperatore} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm">+ Aggiungi</button>
          </div>
          <div className="space-y-2">
            {operatori.map(o => (
              <div key={o.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-sm">{o.nome} {o.cognome}</span>
                <button onClick={() => toggleAttivo('operatori', o.id, o.attivo)} className={`text-[10px] px-3 py-1.5 rounded-full font-bold shadow-sm ${o.attivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {o.attivo ? 'ATTIVO' : 'NON ATTIVO'}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
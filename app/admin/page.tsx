'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [fiere, setFiere] = useState<any[]>([])
  const [operatori, setOperatori] = useState<any[]>([])
  
  // Stati per i nuovi inserimenti
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
    <main className="p-6 bg-gray-50 min-h-screen text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Pannello Gestione</h1>
            <Link href="/dashboard" className="text-blue-600 underline text-sm">Vai ai Contatti →</Link>
        </div>

        {/* GESTIONE FIERE */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">🌍 Gestione Fiere</h2>
          <div className="flex gap-2 mb-6">
            <input type="text" placeholder="Nome Fiera" value={nuovaFiera.nome} onChange={e => setNuovaFiera({...nuovaFiera, nome: e.target.value})} className="flex-1 p-2 border rounded" />
            <input type="text" placeholder="Luogo" value={nuovaFiera.luogo} onChange={e => setNuovaFiera({...nuovaFiera, luogo: e.target.value})} className="flex-1 p-2 border rounded" />
            <button onClick={aggiungiFiera} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">+ Aggiungi</button>
          </div>
          <div className="space-y-2">
            {fiere.map(f => (
              <div key={f.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>{f.nome_fiera} <span className="text-gray-400 text-xs">({f.luogo})</span></span>
                <button onClick={() => toggleAttivo('fiere', f.id, f.attiva)} className={`text-xs px-3 py-1 rounded-full font-bold ${f.attiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {f.attiva ? 'ATTIVA' : 'DISATTIVATA'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* GESTIONE OPERATORI */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">👥 Gestione Operatori</h2>
          <div className="flex gap-2 mb-6">
            <input type="text" placeholder="Nome" value={nuovoOp.nome} onChange={e => setNuovoOp({...nuovoOp, nome: e.target.value})} className="flex-1 p-2 border rounded" />
            <input type="text" placeholder="Cognome" value={nuovoOp.cognome} onChange={e => setNuovoOp({...nuovoOp, cognome: e.target.value})} className="flex-1 p-2 border rounded" />
            <button onClick={aggiungiOperatore} className="bg-green-600 text-white px-4 py-2 rounded font-bold">+ Aggiungi</button>
          </div>
          <div className="space-y-2">
            {operatori.map(o => (
              <div key={o.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>{o.nome} {o.cognome}</span>
                <button onClick={() => toggleAttivo('operatori', o.id, o.attivo)} className={`text-xs px-3 py-1 rounded-full font-bold ${o.attivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
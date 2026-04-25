import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { IconUser, IconWallet, IconPlus, IconLogout, IconChevronUp, IconChevronDown } from './Icons'
import './ProfileMenu.css'

const NIVEL_LABEL = { prata: 'Prata', ouro: 'Ouro', diamante: 'Diamante' }

export default function ProfileMenu() {
 const { perfil, signOut } = useAuth()
 const [open, setOpen] = useState(false)
 const ref = useRef(null)
 const navigate = useNavigate()

 useEffect(() => {
 function onClick(e) {
 if (ref.current && !ref.current.contains(e.target)) setOpen(false)
 }
 document.addEventListener('mousedown', onClick)
 return () => document.removeEventListener('mousedown', onClick)
 }, [])

 if (!perfil) return null

 const iniciais = perfil.nome
 ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?'

 const nivel = perfil.nivel ?? 'prata'

 return (
 <div className="pm-wrap" ref={ref}>
 <button className="pm-trigger" onClick={() => setOpen(o => !o)}>
 {perfil.avatar_url
 ? <img src={perfil.avatar_url} alt={perfil.nome} className="pm-avatar-img" />
 : <div className="pm-avatar-initials">{iniciais}</div>
 }
 <div className="pm-trigger-info">
 <span className="pm-trigger-nome">{perfil.nome_artistico || perfil.nome}</span>
 <span className="pm-trigger-role">{perfil.role}</span>
 </div>
 <span className="pm-chevron">{open ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}</span>
 </button>

 {open && (
 <div className="pm-dropdown">
 {/* Cabeçalho */}
 <div className="pm-dropdown-header">
 {perfil.avatar_url
 ? <img src={perfil.avatar_url} alt={perfil.nome} className="pm-dd-avatar-img" />
 : <div className="pm-dd-avatar-initials">{iniciais}</div>
 }
 <div>
 <div className="pm-dd-nome">{perfil.nome}</div>
 {perfil.nome_artistico && (
 <div className="pm-dd-artistico">"{perfil.nome_artistico}"</div>
 )}
 <div className="pm-dd-email">{perfil.email}</div>
 <span className={`pm-nivel pm-nivel-${nivel}`}>
 {NIVEL_LABEL[nivel] || (nivel.charAt(0).toUpperCase() + nivel.slice(1))}
 </span>
 </div>
 </div>

 <div className="pm-divider" />

 {/* Ações */}
 <button className="pm-item" onClick={() => { setOpen(false); navigate('/perfil/editar') }}>
 <span className="pm-item-icon"><IconUser size={16} /></span>
 Editar perfil
 </button>
 <button className="pm-item" onClick={() => { setOpen(false); navigate('/wallet') }}>
 <span className="pm-item-icon"><IconWallet size={16} /></span>
 Minha wallet
 </button>
 {perfil.role === 'compositor' && (
 <button className="pm-item" onClick={() => { setOpen(false); navigate('/obras/nova') }}>
 <span className="pm-item-icon"><IconPlus size={16} /></span>
 Nova obra
 </button>
 )}

 <div className="pm-divider" />

 <button className="pm-item pm-item-danger" onClick={() => { setOpen(false); signOut() }}>
 <span className="pm-item-icon"><IconLogout size={16} /></span>
 Sair
 </button>
 </div>
 )}
 </div>
 )
}

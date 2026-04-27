import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import StepperCadastro from '../components/StepperCadastro'

// ─── Formatadores ──────────────────────────────────────────────
function formatarCPF(v) {
 const d = v.replace(/\D/g, '').slice(0, 11)
 if (d.length <= 3) return d
 if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
 if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
 return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}
function formatarCEP(v) {
 const d = v.replace(/\D/g, '').slice(0, 8)
 if (d.length <= 5) return d
 return `${d.slice(0,5)}-${d.slice(5)}`
}
// RG aceita dígitos e dígito verificador X (alguns estados)
function formatarRG(v) {
 return v.replace(/[^0-9Xx.\-\s]/g, '').toUpperCase().slice(0, 20)
}

// ─── Validadores client-side ───────────────────────────────────
// Validação completa do CPF (mesma lógica do backend)
function validarCPF(v) {
 const cpf = (v || '').replace(/\D/g, '')
 if (cpf.length !== 11) return false
 if (/^(\d)\1+$/.test(cpf)) return false
 for (let i = 9; i < 11; i++) {
  let soma = 0
  for (let j = 0; j < i; j++) soma += parseInt(cpf[j]) * (i + 1 - j)
  let dv = (soma * 10) % 11
  if (dv === 10) dv = 0
  if (dv !== parseInt(cpf[i])) return false
 }
 return true
}
// RG: aceita 5 a 14 caracteres alfanuméricos (X é aceito como dígito final)
function validarRG(v) {
 const limpo = (v || '').replace(/[^0-9Xx]/g, '')
 if (limpo.length < 5 || limpo.length > 14) return false
 // X só pode aparecer como último caractere
 const semFinalX = limpo.endsWith('X') || limpo.endsWith('x') ? limpo.slice(0, -1) : limpo
 return /^\d+$/.test(semFinalX)
}

export default function CompletarCadastro() {
 const { perfil, refreshPerfil } = useAuth()
 const navigate = useNavigate()

 const [mostrarForm, setMostrarForm] = useState(false)
 const [form, setForm] = useState({
  nome_completo: perfil?.nome_completo ?? perfil?.nome ?? '',
  cpf: perfil?.cpf ?? '',
  rg: perfil?.rg ?? '',
  endereco_rua: perfil?.endereco_rua ?? '',
  endereco_numero: perfil?.endereco_numero ?? '',
  endereco_compl: perfil?.endereco_compl ?? '',
  endereco_bairro: perfil?.endereco_bairro ?? '',
  endereco_cidade: perfil?.endereco_cidade ?? '',
  endereco_uf: perfil?.endereco_uf ?? '',
  endereco_cep: perfil?.endereco_cep ?? '',
 })
 const [salvando, setSalvando] = useState(false)
 const [erro, setErro] = useState('')

 function handleChange(e) {
  let v = e.target.value
  if (e.target.name === 'cpf')          v = formatarCPF(v)
  if (e.target.name === 'rg')           v = formatarRG(v)
  if (e.target.name === 'endereco_cep') v = formatarCEP(v)
  if (e.target.name === 'endereco_uf')  v = v.toUpperCase().slice(0, 2)
  setForm(p => ({ ...p, [e.target.name]: v }))
 }

 async function salvar(e) {
  e.preventDefault()
  setErro('')

  // Validação client-side antes de enviar
  if ((form.nome_completo || '').trim().split(/\s+/).length < 2) {
   setErro('Digite o nome completo (com sobrenome), exatamente como aparece no seu RG.')
   return
  }
  if (!validarCPF(form.cpf)) {
   setErro('CPF inválido. Verifique os 11 dígitos.')
   return
  }
  if (!validarRG(form.rg)) {
   setErro('RG inválido. Use apenas números (e o dígito X se houver), entre 5 e 14 caracteres.')
   return
  }

  setSalvando(true)
  try {
   await api.post('/perfis/me/completar', form)
   await refreshPerfil()
   navigate('/descoberta')
  } catch (err) {
   setErro(err.message)
  } finally { setSalvando(false) }
 }

 // ─── Tela inicial: explicação + botão único "Completar agora" ───
 if (!mostrarForm) {
  return (
   <div style={{ padding: '32px 20px', maxWidth: 640, margin: '0 auto' }}>
    <StepperCadastro etapa={2} />
    <div style={{
     padding: 32, maxWidth: 500, margin: '0 auto',
     display: 'flex',
     flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
     textAlign: 'center',
    }}>
     <div style={{
      width: 80, height: 80, borderRadius: 20,
      background: 'linear-gradient(135deg,#083257,#09090B)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36, color: '#fff', marginBottom: 24,
     }}>📝</div>

     <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
      Completar cadastro
     </h1>
     <p style={{ fontSize: 13, color: 'var(--text-muted, #71717A)', marginBottom: 16, maxWidth: 380 }}>
      Para liberar a publicação de obras, contratos e recebimentos, precisamos dos seus dados oficiais.
     </p>

     <div style={{
      background: '#FEF3C7', border: '1px solid #FBBF24', color: '#78350F',
      padding: '12px 14px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
      maxWidth: 420, marginBottom: 24, textAlign: 'left',
     }}>
      <strong>⚠ Importante:</strong> seu <strong>nome completo</strong> deve ser
      idêntico ao que consta no seu RG/CPF — ele aparecerá em todos os contratos
      gerados pela plataforma e qualquer divergência pode invalidá-los.
     </div>

     <button
      className="btn btn-primary"
      onClick={() => setMostrarForm(true)}
      style={{ fontSize: 15, padding: '14px 32px', minWidth: 240 }}
     >
      Completar agora →
     </button>
     <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, maxWidth: 380, lineHeight: 1.5 }}>
      Os dados são obrigatórios e ficam armazenados de forma criptografada.
     </p>
    </div>
   </div>
  )
 }

 // ─── Formulário completo ───
 return (
  <div style={{ padding: '32px 20px', maxWidth: 640, margin: '0 auto' }}>
   <StepperCadastro etapa={2} />
   <div style={{ maxWidth: 620, margin: '0 auto' }}>
    <button
     onClick={() => setMostrarForm(false)}
     style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: 13, marginBottom: 16 }}
    >
     ← Voltar
    </button>

    <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Dados do cadastro</h1>
    <div style={{
     background: '#FEF3C7', border: '1px solid #FBBF24', color: '#78350F',
     padding: '10px 14px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
     marginBottom: 18,
    }}>
     ⚠ <strong>Atenção:</strong> o nome completo deve ser idêntico ao que consta no seu RG.
     Ele será usado nos contratos.
    </div>

    <form onSubmit={salvar}>
     <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Dados pessoais</h2>

      <div className="form-group">
       <label className="form-label">Nome completo (igual ao RG) *</label>
       <input className="input" name="nome_completo" value={form.nome_completo}
              onChange={handleChange} required minLength={5} maxLength={120}
              placeholder="Ex: Maria Aparecida da Silva Souza" />
       <small style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
        Use o nome civil completo, com todos os sobrenomes.
       </small>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
       <div className="form-group">
        <label className="form-label">CPF *</label>
        <input className="input" name="cpf" value={form.cpf}
               onChange={handleChange} required placeholder="000.000.000-00"
               inputMode="numeric" />
        <small style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
         Validamos o número via dígitos verificadores.
        </small>
       </div>
       <div className="form-group">
        <label className="form-label">RG *</label>
        <input className="input" name="rg" value={form.rg}
               onChange={handleChange} required placeholder="00.000.000-0"
               inputMode="text" />
        <small style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
         Apenas números (use X se for o dígito verificador).
        </small>
       </div>
      </div>
     </div>

     <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Endereço completo</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
       <div className="form-group">
        <label className="form-label">Rua / Avenida *</label>
        <input className="input" name="endereco_rua" value={form.endereco_rua}
               onChange={handleChange} required />
       </div>
       <div className="form-group">
        <label className="form-label">Número *</label>
        <input className="input" name="endereco_numero" value={form.endereco_numero}
               onChange={handleChange} required />
       </div>
      </div>

      <div className="form-group">
       <label className="form-label">Complemento <small style={{ color: 'var(--text-muted)' }}>(opcional)</small></label>
       <input className="input" name="endereco_compl" value={form.endereco_compl}
              onChange={handleChange} placeholder="Apto, bloco, sala..." />
      </div>

      <div className="form-group">
       <label className="form-label">Bairro *</label>
       <input className="input" name="endereco_bairro" value={form.endereco_bairro}
              onChange={handleChange} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
       <div className="form-group">
        <label className="form-label">Cidade *</label>
        <input className="input" name="endereco_cidade" value={form.endereco_cidade}
               onChange={handleChange} required />
       </div>
       <div className="form-group">
        <label className="form-label">UF *</label>
        <input className="input" name="endereco_uf" value={form.endereco_uf}
               onChange={handleChange} required placeholder="SP" />
       </div>
       <div className="form-group">
        <label className="form-label">CEP *</label>
        <input className="input" name="endereco_cep" value={form.endereco_cep}
               onChange={handleChange} required placeholder="00000-000" />
       </div>
      </div>
     </div>

     {erro && (
      <div className="card" style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', marginBottom: 16 }}>
       <p style={{ color: 'var(--error)', fontSize: 14 }}>{erro}</p>
      </div>
     )}

     <button type="submit" className="btn btn-primary" disabled={salvando} style={{ width: '100%', fontSize: 15, padding: '12px 20px' }}>
      {salvando ? 'Salvando…' : '✓ Concluir cadastro'}
     </button>
    </form>
   </div>
  </div>
 )
}

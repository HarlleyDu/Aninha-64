// ============================================================
// DuoTrack — App.js
// Versão: alpha 0.0.33
// ============================================================
//
// ════════════════════════════════════════════════════════════
// 💊 DUOTRACK — DOSSIÊ DEFINITIVO v4.0
// Atualizado até alpha 0.0.33 — passar para qualquer IA continuar.
// ════════════════════════════════════════════════════════════
//
// ┌─────────────────────────────────────────────────────────┐
// │ 🎯 O QUE É ESSE APP                                     │
// └─────────────────────────────────────────────────────────┘
//   App Android de adesão a rotina diária para casais.
//   A mulher marca diariamente que tomou a pílula.
//   Ganha pontos, Antrix (moeda), streak, conquistas e títulos.
//   Sincroniza em tempo real entre os dois celulares via Firebase.
//
//   - Janela de Ouro = horário definido pela mulher ± 10 min (SAGRADO)
//   - Máximo 2 membros por dupla
//   - Ranking global: expõe APENAS nome + pontos (privacidade)
//   - Admin: Harlley (Harlleyduarte@gmail.com)
//   - Distribuição: APK baixado direto pelo app (OTA via Firebase)
//   - Package: com.harlley.aninha64
//
// ┌─────────────────────────────────────────────────────────┐
// │ 🔧 STACK TÉCNICA — PROIBIDO ALTERAR                     │
// └─────────────────────────────────────────────────────────┘
//   Framework:    React Native via Expo SDK 48
//   Motor JS:     Hermes
//   Build:        EAS CLI no Termux (Android)
//   Backend:      Firebase Realtime Database
//   Auth:         Firebase Authentication (email + senha)
//   Storage:      Firebase Storage (fotos de perfil)
//   Notificações: expo-notifications
//   Persistência: getReactNativePersistence(AsyncStorage)
//
//   ⛔ NUNCA mudar: SDK version, Hermes, Firebase backend
//   ⛔ NUNCA usar setPersistence da API web — quebra no RN
//   ⛔ NUNCA usar uploadString/base64 — usar fetch→blob→uploadBytes
//
// ┌─────────────────────────────────────────────────────────┐
// │ 🔑 CONTAS E CREDENCIAIS                                 │
// └─────────────────────────────────────────────────────────┘
//   Expo username:    @aninha64  (duarteharlley@gmail.com)
//   Expo username 2:  harlleydaana
//   GitHub repo:      https://github.com/HarlleyDu/Aninha-64
//   Firebase projeto: aninha-64
//   Firebase DB URL:  https://aninha-64-default-rtdb.firebaseio.com
//   Firebase bucket:  aninha-64.firebasestorage.app
//   Package Android:  com.harlley.aninha64
//   EAS Project ID:   5433fd20-8302-4bb6-9834-e6e6255d0d2b
//   Admin email:      Harlleyduarte@gmail.com
//
// ┌─────────────────────────────────────────────────────────┐
// │ 🗄️  FIREBASE — ESTRUTURA DO BANCO (não alterar)         │
// └─────────────────────────────────────────────────────────┘
//   /usuarios/{uid}
//     nome, email, isAdmin, casalId, genero, criadoEm
//     antrix, indPontos, streak
//     fotoPerfil: "URL permanente Firebase Storage"  ← nunca URI local
//     horarioPessoal: "HH:MM"
//     itensComprados: { temas:[], selos:[], molduras:[] }
//     seloEquipado, molduraEquipada
//     titulosDesbloqueados/{id}: { titulo, cor }
//     tituloEquipado: id
//     conquistas/{id}: { desbloqueada, data }
//     estatisticas: { rankPrimeiro, antrixTotal, tomadasHorarioPerfeito... }
//     escudosDisponiveis: número (padrão 2)
//     ultimoApoio: timestamp
//
//   /casais/{casalId}
//     historico/{"YYYY-MM-DD": {data, hora, tomou, quemMarcou,
//                noHorarioCerto, naJanelaOuro, adminManual?, manualMulher?}}
//     pausa/{inicio, fim, ativa}
//     pontos/{uid1: pts, uid2: pts}
//     fotos/{uid: "URL Firebase Storage"}
//     tema: string (id do tema)
//     membros/{uid: nome}
//     dataInicio: "YYYY-MM-DD"
//     config/horariosNotificacao/{uid}: "HH:MM"
//     mural/{pushId}: {texto, autor, timestamp, uid}
//     sugestoes/ (lista push)
//
//   /pairCodes/{chave6chars}
//     → { casalId }                         ← gerado por quem JÁ tem casal
//     → { geradoPor: uid, nomeCriador: str } ← gerado por quem NÃO tem casal
//     (casal criado em entrarCasal(), deletado após uso)
//
//   /config → { versao, apkUrl, changelog, forcarAtualizar }  ← OTA
//
// ┌─────────────────────────────────────────────────────────┐
// │ 🐾 SISTEMA DE PET — DUOPET (v1.0)                       │
// └─────────────────────────────────────────────────────────┘
//   Cada usuário pode ter 1 pet. Pet só existe após abrir uma caixa na loja.
//   Sem pet: espaço vazio. Com pet: aparece orbitando a foto no perfil.
//   Casal pareado: ambos os pets orbitam juntos na tela do parceiro.
//
//   /usuarios/{uid}/pet
//     tipo: "fogo" | "agua" | "natureza" | "secreto_fofo" | "secreto_sombrio"
//     fase: 1-10  (1=Ovo, 10=???)
//     xp: número
//     energia: 0-100  (decai, 0 = triste/trava evolução)
//     humor: "feliz" | "neutro" | "triste" | "dormindo"
//     ultimaRefeicao: timestamp  (2 dias sem comer = morre)
//     ultimaExploracao: timestamp  (explora a cada 4h se com energia boa)
//     itemExplorado: { nome, raridade, timestamp } | null  (aguarda coleta
//     itens: { chapeu, acessorio, efeito }  (customização equipada)
//     bannerAtivo: "fofo" | "sombrio" | null  (só pets secretos)
//     nome: string (opcional, definido pelo usuário)
//
//   FASES DO PET:
//     1: Ovo         2: Spark      3: Nibble     4: Bloom      5: Bondra
//     6: Lumis       7: Sorvex     8: Eternis    9: Eonix      10: ??? (secreto)
//
//   XP GANHO:
//     Marcar pílula no horário: +50 XP
//     Marcar pílula fora do horário: +10 XP (mas humor cai)
//     Abrir app todo dia: +10 XP
//     Completar conquista: +30 XP
//     Comprar na loja: +5 XP
//     Streak ativo: +streak×2 XP/dia bônus
//     Dar comida: +20 XP por refeição
//     Casal ambos cuidaram hoje: +30 XP bônus
//
//   MORTE: 2 dias sem comer → pet morre e some. Precisa de nova caixa.
//   TRISTEZA: pílula fora do horário OU fome > 8h → humor cai, XP trava.
//   EXPLORAÇÃO: a cada 4h se energia ≥ 50 e com fome ≤ 8h.
//              Volta com item aleatório (notificação + modal).
//
//   CAIXAS DA LOJA (raridades):
//     Comum, Incomum, Rara, Épica, Lendária Fofa, Lendária Sombria, Secreta
//     Caixa Secreta: NÃO pode ser comprada — apenas conseguida por ações secretas.
//
//   PETS SECRETOS:
//     🌸 Pet Fofo Secreto: banner fofo (rosa/partículas suaves)
//        Condição: 🔒 SEGREDO — ver função desbloquearPetSecreto()
//     🖤 Pet Sombrio Secreto: banner sombrio (preto/partículas dark)
//        Condição: 🔒 EASTER EGG — sequência secreta de toques. Ver checkEasterEgg()
//        Disponível para homem E mulher.
//
//   TRANSFERÊNCIA: pode dar seu pet para o parceiro pareado.
//     → pet some do seu perfil, aparece no perfil do parceiro com evolução intacta.
//
//   REGRAS PARA IAs QUE CONTINUAREM:
//     - Pet só existe se usuarios/{uid}/pet existir no Firebase
//     - Nunca criar pet automaticamente — só via abertura de caixa
//     - Energia decai 5 a cada 6h (calcular por timestamp)
//     - Morte verificada ao abrir o app (verificarMortePet)
//     - Easter egg sombrio: sequência de 7 toques específicos em locais do app
//       Sequência: perfil→ranking→conquistas→mural→perfil→ranking→conquistas
//       (navegar essas abas nessa ordem em menos de 30 segundos)
//
// ┌─────────────────────────────────────────────────────────┐
// │ ⭐ MECÂNICA SAGRADA — JANELA DE OURO (NUNCA REMOVER)    │
// └─────────────────────────────────────────────────────────┘
//   Constante: JANELA_TOLERANCIA_MIN = 10
//   - Tomou dentro da janela → ponto para a mulher da dupla
//   - Tomou fora da janela   → ponto para quem marcou
//   - Ciclo de 28 dias       → confete + nova cartela
//   - Pausa de 4 dias disponível (admin ativa, qualquer mulher vê)
//
// ┌─────────────────────────────────────────────────────────┐
// │ 💠 SISTEMA DE RECOMPENSAS                               │
// └─────────────────────────────────────────────────────────┘
//   Antrix: moeda interna — ganho ao marcar, gasto na Loja
//   indPontos: pontuação individual (base do ranking)
//   streak: dias consecutivos marcando
//   escudosDisponiveis: 2 por padrão — protege streak da parceira
//   ultimoApoio: timestamp do último apoio enviado ao parceiro
//
// ┌─────────────────────────────────────────────────────────┐
// │ 📱 ABAS DO APP (swipe ou toque na barra inferior)       │
// └─────────────────────────────────────────────────────────┘
//   🏠 home       → status do dia, countdown, botão marcar
//   📅 calendario → histórico mensal (mulher clica e marca vermelho)
//   🏆 ranking    → pontos da dupla + global
//   🏅 conquistas → conquistas e títulos desbloqueados
//   💌 mural      → mensagens 24h (pareado: vê parceiro / solo: só você)
//   💡 sugestoes  → caixa de sugestões para o Harlley
//   👤 perfil     → foto, stats, customização, configurações
//
// ┌─────────────────────────────────────────────────────────┐
// │ 👑 ADMIN (email: Harlleyduarte@gmail.com)               │
// └─────────────────────────────────────────────────────────┘
//   - Toggle completo no calendário (COM estorno de recompensas)
//   - Definir/redefinir data de início da cartela
//   - Iniciar/encerrar pausa de 4 dias
//   - Antrix infinito, desbloquear tudo, reset geral
//   - Painel admin na aba Perfil
//
// ┌─────────────────────────────────────────────────────────┐
// │ 🔄 SISTEMA OTA — ATUALIZAÇÃO PELO APP                   │
// └─────────────────────────────────────────────────────────┘
//   Ao abrir: app consulta /config no Firebase.
//   Se versao Firebase > VERSAO_ATUAL → modal de atualização.
//   Usuário toca "Baixar e instalar" → baixa APK → instala.
//
//   Script: ~/aninha64/publicar.sh
//   Fluxo completo de lançamento:
//     1. cp /sdcard/Download/App_alpha_X_X_X.js ~/aninha64/App.js
//     2. grep 'VERSAO_ATUAL' ~/aninha64/App.js        ← confirmar versão
//     3. cd ~/aninha64 && git add App.js && git commit -m "vX" && git push
//     4. npx expo start --lan                         ← testar no Expo Go
//     5. EAS_SKIP_AUTO_FINGERPRINT=1 eas build --platform android --profile preview --non-interactive
//     6. bash ~/aninha64/publicar.sh                  ← publica no Firebase
//   Parceira abre o app e vê o modal automaticamente.
//
// ┌─────────────────────────────────────────────────────────┐
// │ 🏗️  REGRAS PARA QUALQUER IA QUE CONTINUAR              │
// └─────────────────────────────────────────────────────────┘
//   1.  NUNCA gerar App.js completo do zero — só mudanças cirúrgicas
//   2.  Cada mudança = nova versão "alpha X.X.X"
//   3.  Versão em: nome do arquivo, primeiras 10 linhas, tela de perfil
//   4.  Janela de Ouro é SAGRADA — nunca remover ou alterar
//   5.  Foto: SEMPRE upload Firebase Storage → salvar URL permanente
//       NUNCA salvar URI local (some ao fechar o app)
//   6.  getStorage() SEMPRE com firebaseApp: getStorage(firebaseApp)
//   7.  Título equipado: SOMENTE abaixo do nome na aba Perfil
//       com badge contorno branco — NÃO no header nem no ranking
//   8.  Calendário: mulher clica e marca/desmarca qualquer dia
//       Admin: toggle completo com estorno de recompensas
//   9.  marcarTomou() e adminToggleDia() requerem casalId
//       Sem casal → não marca (comportamento correto)
//  10.  gerarCodigoConvite() NÃO cria casal — casal criado só em entrarCasal()
//  11.  Ranking global: filtrar só uid com casalId OU streak > 0
//  12.  Cadastro: dar boas_vindas E criar_conta simultaneamente
//  13.  Início da cartela: disponível para QUALQUER mulher (não só admin)
//  14.  Horário: TextInput editável + setas ▲▼ funcionando juntos
//  15.  Mural sem casal: salva/exibe só para o próprio usuário
//       Mural com casal: ambos membros veem mensagens um do outro
//
// ┌─────────────────────────────────────────────────────────┐
// │ 📖 LIVRO NEGRO — Erros conhecidos (nunca repetir)       │
// └─────────────────────────────────────────────────────────┘
//   ❌ uploadString/base64 → fetch(uri) → blob → uploadBytes
//   ❌ getStorage() sem arg → getStorage(firebaseApp)
//   ❌ URI local na foto → some ao fechar; usar URL do Storage
//   ❌ setPersistence web API → getReactNativePersistence(AsyncStorage)
//   ❌ ConsistencyCircle RADIUS=(SW-80)/2 → ocupa tela inteira
//   ❌ Estado inicial 'auth' → usar 'splash', onAuthStateChanged decide
//   ❌ PanResponder sem ref → usar abaAtivaRef para swipe correto
//   ❌ Build sem EAS_SKIP_AUTO_FINGERPRINT=1 → fingerprint bug EAS
//   ❌ Criar casal em gerarCodigoConvite → só em entrarCasal()
//   ❌ adminToggleDia sem checar ehMulher → bloqueia mulher no calendário
//   ❌ Título fora da aba Perfil → aparece em lugares indevidos
//   ❌ Ranking sem filtro → contas fantasma sujam o global
//
// ┌─────────────────────────────────────────────────────────┐
// │ 📋 CHANGELOG                                            │
// └─────────────────────────────────────────────────────────┘
//   alpha 0.0.1  — countdown em segundos, botão verde na janela,
//                  admin desbloquear conquistas, barra de abas menor
//   alpha 0.0.2  — ConsistencyCircle compacto (80px)
//   alpha 0.0.3  — documentação completa no código
//   alpha 0.0.23 — login/cadastro direto, sem tela pair, sem horário fixo
//   alpha 0.0.25 — 8 bugs + papel do homem + escudo streak + apoio diário
//   alpha 0.0.26 — 9 fixes (titulo, cadastro, calendario, convite, horario,
//                  cartela, foto Storage, ranking, getStorage fix)
//   alpha 0.0.27 — dossiê atualizado para v4.0 com todas as regras,
//                  livro negro e fluxo OTA documentados no código
//
//   alpha 0.0.28 — marcar pílula, calendário e data de início funcionam sem casal
//   alpha 0.0.29 — migração solo→casal automática ao parear
//   alpha 0.0.30 — sistema de pet completo (10 fases, caixas, exploração,
//   alpha 0.0.31 — correção de SyntaxError na string do easter egg Pet Sombrio
//   alpha 0.0.32 — correção de SyntaxError na string do easter egg Pet Fofo
//   alpha 0.0.33 — correção de SyntaxError na string da Caixa Secreta (JSX)
//                  banner secreto, easter egg sombrio, transferência entre casal)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, Modal, Animated, Image,
  ActivityIndicator, Dimensions, PanResponder, StatusBar, FlatList, Platform
} from 'react-native';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import {
  getDatabase, ref, set, get, onValue, push, remove, off, update, query, orderByChild, limitToLast
} from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from 'firebase/auth';
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDd7KKg2c7DEnlGADbUApV3bMsRvmjV_ro",
  authDomain: "aninha-64.firebaseapp.com",
  databaseURL: "https://aninha-64-default-rtdb.firebaseio.com",
  projectId: "aninha-64",
  storageBucket: "aninha-64.firebasestorage.app",
  messagingSenderId: "777356459597",
  appId: "1:777356459597:android:9c98335212f8c981742604"
};

let firebaseApp, db, auth;
try {
  firebaseApp = initializeApp(firebaseConfig);
  db = getDatabase(firebaseApp);
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const VERSAO_ATUAL  = "alpha 0.0.33";
const ADMIN_EMAIL   = "Harlleyduarte@gmail.com";

// ── Sistema de Pet ──────────────────────────────────────────────
const PET_FASES = [
  null, // índice 0 não usado
  { nome: 'Ovo',     emoji: '🥚', xpNecessario: 0   },
  { nome: 'Spark',   emoji: '✨', xpNecessario: 100  },
  { nome: 'Nibble',  emoji: '🐣', xpNecessario: 250  },
  { nome: 'Bloom',   emoji: '🌱', xpNecessario: 500  },
  { nome: 'Bondra',  emoji: '💫', xpNecessario: 900  },
  { nome: 'Lumis',   emoji: '🌟', xpNecessario: 1400 },
  { nome: 'Sorvex',  emoji: '⚡', xpNecessario: 2100 },
  { nome: 'Eternis', emoji: '🔮', xpNecessario: 3000 },
  { nome: 'Eonix',   emoji: '🌌', xpNecessario: 4200 },
  { nome: '???',     emoji: '👁️', xpNecessario: 6000 },
];

const PET_TIPOS = {
  fogo:     { nome: 'Fogo',     cor: '#ff4500', corSecundaria: '#ff8c00', emoji: '🔥' },
  agua:     { nome: 'Água',     cor: '#00bfff', corSecundaria: '#00e5ff', emoji: '💧' },
  natureza: { nome: 'Natureza', cor: '#00cc66', corSecundaria: '#ffd700', emoji: '🌿' },
  secreto_fofo:    { nome: '???', cor: '#ff69b4', corSecundaria: '#ffb6c1', emoji: '🌸', secreto: true },
  secreto_sombrio: { nome: '???', cor: '#1a0030', corSecundaria: '#4b0082', emoji: '🖤', secreto: true },
};

const PET_CAIXAS = [
  { id: 'caixa_comum',     nome: 'Caixa Comum',          preco: 50,   raridade: 'Comum',          emoji: '📦', cor: '#aaaaaa' },
  { id: 'caixa_incomum',   nome: 'Caixa Incomum',        preco: 120,  raridade: 'Incomum',         emoji: '📫', cor: '#55aa55' },
  { id: 'caixa_rara',      nome: 'Caixa Rara',           preco: 300,  raridade: 'Rara',            emoji: '💼', cor: '#5588ff' },
  { id: 'caixa_epica',     nome: 'Caixa Épica',          preco: 700,  raridade: 'Épica',           emoji: '🎁', cor: '#aa44ff' },
  { id: 'caixa_lend_fofa', nome: 'Caixa Lendária Fofa',  preco: 1500, raridade: 'Lendária Fofa',   emoji: '🌸', cor: '#ff69b4' },
  { id: 'caixa_lend_somb', nome: 'Caixa Lendária Sombria',preco:1500, raridade: 'Lendária Sombria', emoji: '🖤', cor: '#4b0082' },
  // Caixa Secreta: NÃO comprável — só por conquista
];

// Probabilidades de pet por caixa
const PET_CAIXA_CHANCES = {
  caixa_comum:     ['fogo','agua','natureza'],
  caixa_incomum:   ['fogo','agua','natureza'],
  caixa_rara:      ['fogo','agua','natureza'],
  caixa_epica:     ['fogo','agua','natureza'],
  caixa_lend_fofa: ['secreto_fofo'],
  caixa_lend_somb: ['secreto_sombrio'],
};

// Itens de exploração por raridade
const PET_ITENS_EXPLORACAO = [
  { nome: 'Sementinha', raridade: 'Comum',   xpBonus: 10, antrixBonus: 5  },
  { nome: 'Cristalzinho', raridade: 'Incomum', xpBonus: 25, antrixBonus: 15 },
  { nome: 'Gema Brilhante', raridade: 'Rara',  xpBonus: 60, antrixBonus: 40 },
  { nome: 'Fragmento Épico', raridade: 'Épica', xpBonus: 150, antrixBonus: 100 },
  { nome: 'Essência Lendária', raridade: 'Lendária', xpBonus: 400, antrixBonus: 300 },
];
const JANELA_TOLERANCIA_MIN = 10; // janela de ouro = horário definido ± 10 min
const { width: SW } = Dimensions.get('window');

const TEMAS_BASE = {
  roxo:   { primary:'#ff2d78', bg:'#0a0010', card:'#130020', border:'#2a1040', accent:'#7b2fff', text:'#fff', sub:'#aa88cc' },
  dourado:{ primary:'#ffd60a', bg:'#0a0800', card:'#1a1200', border:'#3a2a00', accent:'#ff9500', text:'#fff', sub:'#ccaa44' },
  ciano:  { primary:'#00e5ff', bg:'#000a10', card:'#001520', border:'#003040', accent:'#0088cc', text:'#fff', sub:'#44aacc' },
  verde:  { primary:'#00ff87', bg:'#000a05', card:'#001510', border:'#003020', accent:'#00cc66', text:'#fff', sub:'#44cc88' },
};

// ════════════════════════════════════════════════════════════════════
// 🎨 ÁREA DE PERSONALIZAÇÃO DO HARLLEY — NÃO REMOVER ESTE BLOCO
// ════════════════════════════════════════════════════════════════════
// Tudo abaixo será preenchido pelo Harlley com seus próprios designs.
// Itens lendários e secretos são DESENHADOS À MÃO pelo Harlley.
// Outras IAs devem PRESERVAR este bloco e apenas adicionar dentro dele.
//
// TEMAS PERSONALIZADOS (adicionar aqui):
// Exemplo: { id: 'meu_tema', nome: 'Meu Tema', preco: 500, cor: '#000000', bg: '#0a0000', ... }
const TEMAS_PERSONALIZADOS_HARLLEY = [
  // { id: 'exemplo', nome: 'Exemplo', preco: 500, cor: '#ff0000' },
];
//
// SELOS PERSONALIZADOS (desenhados à mão — lendários):
// Adicionar na lista ITENS_LOJA.selos.lendario ou criar nova categoria
const SELOS_PERSONALIZADOS_HARLLEY = [
  // { id: 'selo_harlley_1', nome: 'Símbolo Especial', preco: 300, emoji: '🎨' },
];
//
// MOLDURAS PERSONALIZADAS (desenhadas à mão — lendárias):
const MOLDURAS_PERSONALIZADAS_HARLLEY = [
  // { id: 'moldura_harlley_1', nome: 'Moldura Exclusiva', preco: 300, cor: '#ff2d78', estilo: 'solid' },
];
//
// CONQUISTAS SECRETAS PERSONALIZADAS:
// Adicionar em CONQUISTAS.especial
// { id: 'conquista_secreta_1', nome: '...', titulo: '...', corTitulo: '#fff', cond: () => false }
//
// ════════════════════════════════════════════════════════════════════

const ITENS_LOJA = {
  temas: {
    comum: [
      { id: 'rosa', nome: 'Rosa', preco: 20, cor: '#ff69b4' },
      { id: 'azul', nome: 'Azul', preco: 20, cor: '#3498db' },
      { id: 'roxo', nome: 'Roxo', preco: 20, cor: '#9b59b6' },
      { id: 'branco', nome: 'Branco', preco: 20, cor: '#ffffff' },
      { id: 'preto', nome: 'Preto', preco: 20, cor: '#000000' },
      { id: 'verde', nome: 'Verde', preco: 20, cor: '#2ecc71' },
      { id: 'vermelho', nome: 'Vermelho', preco: 20, cor: '#e74c3c' },
      { id: 'laranja', nome: 'Laranja', preco: 20, cor: '#f39c12' },
      { id: 'amarelo', nome: 'Amarelo', preco: 20, cor: '#f1c40f' },
      { id: 'cinza', nome: 'Cinza', preco: 20, cor: '#95a5a6' }
    ],
    raro: [
      { id: 'preto_rosa', nome: 'Preto + Rosa Neon', preco: 80, cor: '#000000', destaque: '#ff2d78' },
      { id: 'preto_roxo', nome: 'Preto + Roxo', preco: 80, cor: '#000000', destaque: '#9b59b6' },
      { id: 'preto_azul', nome: 'Preto + Azul Neon', preco: 80, cor: '#000000', destaque: '#3498db' },
      { id: 'vermelho_preto', nome: 'Vermelho + Preto', preco: 80, cor: '#e74c3c', destaque: '#000000' },
      { id: 'branco_rosa', nome: 'Branco + Rosa', preco: 80, cor: '#ffffff', destaque: '#ff69b4' },
      { id: 'roxo_azul', nome: 'Roxo + Azul', preco: 80, cor: '#9b59b6', destaque: '#3498db' },
      { id: 'verde_preto', nome: 'Verde Neon + Preto', preco: 80, cor: '#2ecc71', destaque: '#000000' },
      { id: 'azul_branco', nome: 'Azul Escuro + Branco', preco: 80, cor: '#2c3e50', destaque: '#ffffff' },
      { id: 'rosa_preto', nome: 'Rosa + Preto', preco: 80, cor: '#ff69b4', destaque: '#000000' },
      { id: 'roxo_escuro_rosa', nome: 'Roxo Escuro + Rosa', preco: 80, cor: '#8e44ad', destaque: '#ff69b4' }
    ],
    bonito: [
      { id: 'ceu_soft', nome: 'Céu Soft', preco: 200, cor: '#a0d2eb' },
      { id: 'aesthetic_soft', nome: 'Aesthetic Soft', preco: 200, cor: '#f5c6e0' },
      { id: 'love_pastel', nome: 'Love Pastel', preco: 200, cor: '#ffb7c5' },
      { id: 'minimalista_branco', nome: 'Minimalista Branco', preco: 200, cor: '#f8f9fa' },
      { id: 'dark_clean', nome: 'Dark Clean', preco: 200, cor: '#1e1e2f' },
      { id: 'anime_soft', nome: 'Anime Soft', preco: 200, cor: '#ffd1dc' },
      { id: 'pink_aesthetic', nome: 'Pink Aesthetic', preco: 200, cor: '#ff99cc' },
      { id: 'galaxy', nome: 'Galaxy', preco: 200, cor: '#4b0082' },
      { id: 'sunset', nome: 'Sunset', preco: 200, cor: '#ff7e5e' },
      { id: 'dream_love', nome: 'Dream Love', preco: 200, cor: '#cdb4db' }
    ],
    lendario: [
      { id: 'duo_especial', nome: 'Duo Especial', preco: 500, cor: '#ff2d78' },
      { id: 'coracao_negro', nome: 'Coraçãozinho Negro', preco: 500, cor: '#000000', destaque: '#ff2d78' },
      { id: 'amor_desenho', nome: 'Amor de Desenho', preco: 500, cor: '#ffaa66' },
      { id: 'amor_dois', nome: 'Amor a Dois', preco: 500, cor: '#ff66cc' },
      { id: 'amor_anime', nome: 'Amor Anime', preco: 500, cor: '#ff99cc' },
      { id: 'amor_negro', nome: 'Amor Negro', preco: 500, cor: '#333333', destaque: '#ff2d78' },
      { id: 'coracao_rosa_neon', nome: 'Coração Rosa Neon', preco: 500, cor: '#ff2d78' },
      { id: 'amor_para_sempre', nome: 'Amor Para Sempre', preco: 500, cor: '#ff66cc' },
      { id: 'casal_apaixonado', nome: 'Casal Apaixonado', preco: 500, cor: '#ff99cc' },
      { id: 'minha_garotinha', nome: 'Minha Garotinha', preco: 500, cor: '#ff66cc' }
    ]
  },
  selos: {
    comum: [
      { id: 'coracao_rosa', nome: '💗 coração rosa', preco: 15, emoji: '💗' },
      { id: 'estrela', nome: '⭐ estrela', preco: 15, emoji: '⭐' },
      { id: 'brilho', nome: '💫 brilho', preco: 15, emoji: '💫' },
      { id: 'lua', nome: '🌙 lua', preco: 15, emoji: '🌙' },
      { id: 'flor', nome: '🌸 flor', preco: 15, emoji: '🌸' },
      { id: 'coelhinho', nome: '🐰 coelhinho', preco: 15, emoji: '🐰' },
      { id: 'borboleta', nome: '🦋 borboleta', preco: 15, emoji: '🦋' },
      { id: 'laco_rosa', nome: '🎀 laço rosa', preco: 15, emoji: '🎀' },
      { id: 'arco_iris', nome: '🌈 arco-íris', preco: 15, emoji: '🌈' },
      { id: 'ursinho', nome: '🐻 ursinho', preco: 15, emoji: '🐻' }
    ],
    raro: [
      { id: 'coroa', nome: '👑 coroa', preco: 60, emoji: '👑' },
      { id: 'coracao_roxo', nome: '💜 coração roxo neon', preco: 60, emoji: '💜' },
      { id: 'fogo_rosa', nome: '🔥 fogo rosa', preco: 60, emoji: '🔥' },
      { id: 'coracao_negro', nome: '🖤 coração negro', preco: 60, emoji: '🖤' },
      { id: 'brilho_forte', nome: '✨ brilho forte', preco: 60, emoji: '✨' },
      { id: 'diamante', nome: '💎 diamante', preco: 60, emoji: '💎' },
      { id: 'unicornio', nome: '🦄 unicórnio', preco: 60, emoji: '🦄' },
      { id: 'raio_rosa', nome: '⚡ raio rosa', preco: 60, emoji: '⚡' },
      { id: 'aura_galaxia', nome: '🌌 aura galáxia', preco: 60, emoji: '🌌' },
      { id: 'simbolo_fofo', nome: '🕊️ símbolo fofo', preco: 60, emoji: '🕊️' }
    ],
    lendario: [
      { id: 'coracao_desenho', nome: 'Coração desenhado à mão', preco: 300, emoji: '❤️' },
      { id: 'estrela_desenho', nome: 'Estrela desenhada à mão', preco: 300, emoji: '⭐' },
      { id: 'casal_desenho', nome: 'Emoji casal desenhado', preco: 300, emoji: '💑' },
      { id: 'simbolo_secreto', nome: 'Símbolo secreto do app', preco: 300, emoji: '🔮' },
      { id: 'emoji_exclusivo', nome: 'Emoji fofo exclusivo', preco: 300, emoji: '💖' },
      { id: 'assinatura_desenho', nome: 'Assinatura desenhada', preco: 300, emoji: '✍️' },
      { id: 'marca_criador', nome: 'Marca exclusiva do criador', preco: 300, emoji: '🎨' },
      { id: 'animado_futuro', nome: 'Emoji especial animado', preco: 300, emoji: '✨' },
      { id: 'assinatura_duo', nome: 'Emoji dupla especial', preco: 300, emoji: '👩‍❤️‍👨' },
      { id: 'assinatura_criador', nome: 'Emoji exclusivo', preco: 300, emoji: '💘' }
    ]
  },
  molduras: {
    comum: [
      { id: 'moldura_simples', nome: 'Moldura Simples', preco: 20, cor: '#ffffff', estilo: 'solid' },
      { id: 'moldura_rosa', nome: 'Moldura Rosa', preco: 20, cor: '#ff69b4', estilo: 'solid' },
      { id: 'moldura_azul', nome: 'Moldura Azul', preco: 20, cor: '#3498db', estilo: 'solid' },
      { id: 'moldura_roxo', nome: 'Moldura Roxo', preco: 20, cor: '#9b59b6', estilo: 'solid' },
      { id: 'moldura_verde', nome: 'Moldura Verde', preco: 20, cor: '#2ecc71', estilo: 'solid' },
      { id: 'moldura_amarela', nome: 'Moldura Amarela', preco: 20, cor: '#f1c40f', estilo: 'solid' },
      { id: 'moldura_laranja', nome: 'Moldura Laranja', preco: 20, cor: '#f39c12', estilo: 'solid' },
      { id: 'moldura_preta', nome: 'Moldura Preta', preco: 20, cor: '#000000', estilo: 'solid' },
      { id: 'moldura_branca', nome: 'Moldura Branca', preco: 20, cor: '#ffffff', estilo: 'solid' },
      { id: 'moldura_cinza', nome: 'Moldura Cinza', preco: 20, cor: '#95a5a6', estilo: 'solid' }
    ],
    raro: [
      { id: 'moldura_dourada', nome: 'Moldura Dourada', preco: 80, cor: '#ffd700', estilo: 'solid' },
      { id: 'moldura_prateada', nome: 'Moldura Prateada', preco: 80, cor: '#c0c0c0', estilo: 'solid' },
      { id: 'moldura_brilho', nome: 'Moldura Brilho', preco: 80, cor: '#ffaa44', estilo: 'solid' },
      { id: 'moldura_floral', nome: 'Moldura Floral', preco: 80, cor: '#ff99cc', estilo: 'solid' },
      { id: 'moldura_estrelas', nome: 'Moldura Estrelas', preco: 80, cor: '#fff000', estilo: 'solid' },
      { id: 'moldura_coracao', nome: 'Moldura Coração', preco: 80, cor: '#ff2d78', estilo: 'solid' },
      { id: 'moldura_geometrica', nome: 'Moldura Geométrica', preco: 80, cor: '#44ff44', estilo: 'solid' },
      { id: 'moldura_arcoiris', nome: 'Moldura Arco-íris', preco: 80, cor: '#ffaa44', estilo: 'gradient' },
      { id: 'moldura_glitch', nome: 'Moldura Glitch', preco: 80, cor: '#ff00ff', estilo: 'solid' },
      { id: 'moldura_neon', nome: 'Moldura Neon', preco: 80, cor: '#00ffcc', estilo: 'solid' }
    ],
    lendario: [
      { id: 'moldura_galaxia', nome: 'Moldura Galáxia', preco: 300, cor: '#aa88ff', estilo: 'solid' },
      { id: 'moldura_amor_eterno', nome: 'Moldura Amor Eterno', preco: 300, cor: '#ff66cc', estilo: 'solid' },
      { id: 'moldura_casamento', nome: 'Moldura Casamento', preco: 300, cor: '#fff0f0', estilo: 'solid' },
      { id: 'moldura_rainbow', nome: 'Moldura Rainbow', preco: 300, cor: '#ffaa44', estilo: 'gradient' },
      { id: 'moldura_diamante', nome: 'Moldura Diamante', preco: 300, cor: '#b9f2ff', estilo: 'solid' },
      { id: 'moldura_sonho', nome: 'Moldura Sonho', preco: 300, cor: '#cbaacb', estilo: 'solid' },
      { id: 'moldura_lua', nome: 'Moldura Lua', preco: 300, cor: '#f5e6d3', estilo: 'solid' },
      { id: 'moldura_sol', nome: 'Moldura Sol', preco: 300, cor: '#ffaa44', estilo: 'solid' },
      { id: 'moldura_estrela_cadente', nome: 'Moldura Estrela Cadente', preco: 300, cor: '#ffcc88', estilo: 'solid' },
      { id: 'moldura_criador', nome: 'Moldura Criador', preco: 300, cor: '#ff2d78', estilo: 'solid' }
    ],
  }
};

const RECOMPENSAS_ESPECIAIS = {
  tema_favorita: { id: 'tema_favorita', nome: 'Tema A Favorita', cor: '#ff66cc' },
  tema_anjo_rosa: { id: 'tema_anjo_rosa', nome: 'Tema Anjo Rosa', cor: '#ffb7c5' },
  tema_rainha_jogo: { id: 'tema_rainha_jogo', nome: 'Tema Rainha do Jogo', cor: '#ffd966' },
  tema_criadora_amor: { id: 'tema_criadora_amor', nome: 'Tema Criadora do Amor', cor: '#ff99ff' },
  tema_lenda_absoluta: { id: 'tema_lenda_absoluta', nome: 'Tema Lenda Absoluta', cor: '#ffaa44' },
  moldura_anjo_rosa: { id: 'moldura_anjo_rosa', nome: 'Moldura Anjo Rosa', preco: 0, cor: '#ffb7c5', estilo: 'solid', animado: true },
  moldura_rainha_jogo: { id: 'moldura_rainha_jogo', nome: 'Moldura Rainha do Jogo', preco: 0, cor: '#ffd966', estilo: 'solid', animado: true },
  moldura_lenda_absoluta: { id: 'moldura_lenda_absoluta', nome: 'Moldura Lenda Absoluta', preco: 0, cor: '#ffaa44', estilo: 'gradient', animado: true },
  moldura_galaxia: { id: 'moldura_galaxia', nome: 'Moldura Galáxia', preco: 0, cor: '#aa88ff', estilo: 'solid' },
  moldura_estrela_cadente: { id: 'moldura_estrela_cadente', nome: 'Moldura Estrela Cadente', preco: 0, cor: '#ffcc88', estilo: 'solid' }
};

const CONQUISTAS = {
  especial: [
    { id: 'boas_vindas', nome: '🎉 Bem-vindo(a) ao app!', titulo: 'Novato(a)', corTitulo: '#aaaaff', cond: (s) => false, recompensa: { antrix: 10 } },
  ],
  streak: [
    { id: 'streak3', nome: '3 dias seguidos', titulo: 'Iniciante', corTitulo: '#aaa', cond: (s) => s.streak >= 3, recompensa: { antrix: 20 } },
    { id: 'streak5', nome: '5 dias seguidos', titulo: 'Persistente', corTitulo: '#ccc', cond: (s) => s.streak >= 5, recompensa: { antrix: 20 } },
    { id: 'streak7', nome: '7 dias seguidos', titulo: 'Disciplinado', corTitulo: '#ffaa66', cond: (s) => s.streak >= 7, recompensa: { antrix: 50 } },
    { id: 'streak10', nome: '10 dias seguidos', titulo: 'Dedicado', corTitulo: '#ffaa66', cond: (s) => s.streak >= 10, recompensa: { antrix: 50 } },
    { id: 'streak15', nome: '15 dias seguidos', titulo: 'Comprometido', corTitulo: '#ffaa66', cond: (s) => s.streak >= 15, recompensa: { antrix: 100 } },
    { id: 'streak20', nome: '20 dias seguidos', titulo: 'Inabalável', corTitulo: '#ffaa66', cond: (s) => s.streak >= 20, recompensa: { antrix: 100 } },
    { id: 'streak30', nome: '30 dias seguidos', titulo: 'Herói da Rotina', corTitulo: '#ffaa66', cond: (s) => s.streak >= 30, recompensa: { antrix: 200 } },
  ],
  antrix: [
    { id: 'antrix100', nome: 'Juntar 100 Antrix', titulo: 'Colecionador', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 100, recompensa: { antrix: 0 } },
    { id: 'antrix250', nome: 'Juntar 250 Antrix', titulo: 'Acumulador', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 250, recompensa: { antrix: 0 } },
    { id: 'antrix500', nome: 'Juntar 500 Antrix', titulo: 'Tesoureiro', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 500, recompensa: { antrix: 0 } },
  ],
  app: [
    { id: 'criar_conta', nome: 'Criar conta', titulo: 'Bem-vindo', corTitulo: '#aaa', cond: () => true, recompensa: { antrix: 10 } },
    { id: 'perfeito5', nome: 'Tomar no horário perfeito 5 vezes', titulo: 'Pontual', corTitulo: '#aaa', cond: (s) => s.tomadasHorarioPerfeito >= 5, recompensa: { antrix: 50 } },
    { id: 'perfeito10', nome: 'Tomar no horário perfeito 10 vezes', titulo: 'Cronômetro', corTitulo: '#aaa', cond: (s) => s.tomadasHorarioPerfeito >= 10, recompensa: { antrix: 100 } },
  ],
  // ⚠️ CONQUISTA SECRETA — não exibir nome real na UI, mostrar apenas '???' e cadeado
  segredo: [
    {
      id: 'amor_64',
      nome: '???',                          // nome real oculto na UI
      nomeSecreto: 'Eu Te Amo 64 Meu Neném', // frase que o usuário deve digitar
      titulo: 'Aquele Que Ama Mais',
      corTitulo: '#000000',                  // preto
      secreto: true,
      cond: (s) => s.amor64 === true,        // ativado via input especial
      recompensa: { antrix: 64 },
    },
  ],
};

const getItemById = (tipo, id) => {
  for (let cat of Object.values(ITENS_LOJA[tipo])) {
    const found = cat.find(i => i.id === id);
    if (found) return found;
  }
  return null;
};

const getTemaById = (id) => getItemById('temas', id) || RECOMPENSAS_ESPECIAIS[id];
const getSeloById = (id) => getItemById('selos', id);
const getMolduraById = (id) => getItemById('molduras', id) || RECOMPENSAS_ESPECIAIS[id];

const dateToKey = d => d.toISOString().slice(0, 10);
const todayKey  = () => dateToKey(new Date());
const addDias   = (key, n) => {
  try { const d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return dateToKey(d); }
  catch(e) { return key; }
};
const diasNoMes = (mes, ano) => new Date(ano, mes + 1, 0).getDate();
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const estaDentroJanela = (horario, tolerMin = 10, agora = new Date()) => {
  if (!horario) return false;
  const [h, m] = horario.split(':').map(Number);
  const r = new Date(agora); r.setHours(h, m, 0, 0);
  return Math.abs(agora.getTime() - r.getTime()) / 60000 <= tolerMin;
};

const versaoMaior = (nova, atual) => {
  if (!nova || !atual) return false;
  // Remove prefixo "alpha " ou similar antes de comparar números
  const limpar = v => v.replace(/^[^0-9]*/, '');
  const p = v => limpar(v).split('.').map(n => parseInt(n, 10) || 0);
  const [maN, miN, ptN] = p(nova); const [maA, miA, ptA] = p(atual);
  if (maN !== maA) return maN > maA; if (miN !== miA) return miN > miA; return ptN > ptA;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// ── Componente Pet Orbital ──────────────────────────────────────
function PetOrbital({ pet, tamanho = 100, mostrarParceiro = false, petParceiro = null }) {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(orbitAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -6, duration: 1000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  if (!pet) return null;

  const faseInfo = PET_FASES[pet.fase] || PET_FASES[1];
  const tipoInfo = PET_TIPOS[pet.tipo] || PET_TIPOS.fogo;
  const raio = tamanho * 0.65;

  const rotateInterpolate = orbitAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg']
  });

  // Estado visual
  const corPet = pet.humor === 'triste' ? '#888' : tipoInfo.cor;
  const opacidadePet = pet.humor === 'dormindo' ? 0.5 : 1;

  return (
    <Animated.View style={{
      position: 'absolute',
      width: tamanho + raio * 2,
      height: tamanho + raio * 2,
      left: -(raio),
      top: -(raio),
      transform: [{ rotate: rotateInterpolate }],
    }}>
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: (tamanho + raio * 2) / 2 - 16,
        transform: [{ translateY: floatAnim }],
        opacity: opacidadePet,
      }}>
        <View style={{
          backgroundColor: corPet + '33',
          borderRadius: 20,
          padding: 4,
          borderWidth: 1,
          borderColor: corPet,
        }}>
          <Text style={{ fontSize: 22 }}>{faseInfo.emoji}</Text>
        </View>
        {pet.humor === 'triste' && (
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#888' }}>😢</Text>
        )}
        {pet.humor === 'dormindo' && (
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#aaa' }}>💤</Text>
        )}
      </Animated.View>

      {/* Pet do parceiro (órbita oposta) */}
      {mostrarParceiro && petParceiro && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: (tamanho + raio * 2) / 2 - 16,
        }}>
          <View style={{
            backgroundColor: (PET_TIPOS[petParceiro.tipo]?.cor || '#ff2d78') + '33',
            borderRadius: 20,
            padding: 4,
            borderWidth: 1,
            borderColor: PET_TIPOS[petParceiro.tipo]?.cor || '#ff2d78',
          }}>
            <Text style={{ fontSize: 20 }}>{(PET_FASES[petParceiro.fase] || PET_FASES[1]).emoji}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ── Banner do pet secreto ────────────────────────────────────────
function BannerPetSecreto({ tipo, tema }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1500, useNativeDriver: true }),
    ])).start();
  }, []);
  if (!tipo) return null;
  const isFofo = tipo === 'fofo';
  const corPrimaria = isFofo ? '#ff69b4' : '#4b0082';
  const corSecundaria = isFofo ? '#ffb6c1' : '#1a0030';
  const emoji = isFofo ? '🌸' : '🖤';
  const opacidade = pulse.interpolate({ inputRange: [0,1], outputRange: [0.6,1] });
  return (
    <Animated.View style={{
      width: '100%', borderRadius: 12, padding: 10, marginBottom: 10,
      backgroundColor: corSecundaria,
      borderWidth: 1.5, borderColor: corPrimaria,
      opacity: opacidade,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={{ color: corPrimaria, fontWeight: '900', fontSize: 13, letterSpacing: 1 }}>
        {isFofo ? 'GUARDIÃO DO AMOR' : 'PORTADOR DAS SOMBRAS'}
      </Text>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </Animated.View>
  );
}

// Círculo de consistência compacto — não ocupa a tela toda
function ConsistencyCircle({ historico, dataInicio, tema, horario }) {
  const TOTAL = 30;
  const SIZE  = 88;
  const R     = SIZE / 2;
  const DOT   = 5;
  const hoje  = todayKey();

  // Se não tem dataInicio definido, mostra círculo vazio com aviso
  if (!dataInicio) {
    const dotsVazios = Array.from({ length: TOTAL }, (_, i) => {
      const angle = (i / TOTAL) * 2 * Math.PI - Math.PI / 2;
      return {
        x: R + Math.cos(angle) * (R - DOT) - DOT / 2,
        y: R + Math.sin(angle) * (R - DOT) - DOT / 2,
        cor: tema.border,
      };
    });
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
          <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: R, borderWidth: 1, borderColor: tema.border }} />
          {dotsVazios.map((d, i) => (
            <View key={i} style={{ position: 'absolute', left: d.x, top: d.y, width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: d.cor }} />
          ))}
          <View style={{ position: 'absolute', top: SIZE * 0.25, left: SIZE * 0.25, width: SIZE * 0.5, height: SIZE * 0.5, borderRadius: SIZE * 0.25, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: tema.sub, fontSize: 9, fontWeight: '700' }}>—</Text>
          </View>
        </View>
        <View>
          <Text style={{ color: tema.sub, fontSize: 12 }}>Ciclo não iniciado</Text>
          <Text style={{ color: tema.sub, fontSize: 10, marginTop: 2 }}>Admin define a data de início</Text>
        </View>
      </View>
    );
  }

  const getDayKey = (idx) => {
    const d = new Date(dataInicio + 'T12:00:00');
    d.setDate(d.getDate() + idx - 1);
    return dateToKey(d);
  };

  const totalTomou = Object.values(historico).filter(e => e?.tomou).length;

  const diasPassados = (() => {
    // Se hoje ainda não passou do horário da pílula + tolerância, não conta hoje como passado
    const agora = new Date();
    if (!horario) { return TOTAL; }
    const [h, m] = horario.split(':').map(Number);
    const limiteHoje = new Date();
    limiteHoje.setHours(h, m + JANELA_TOLERANCIA_MIN, 0, 0);
    
    const hojeJaPassouDoHorario = agora > limiteHoje;
    const dataReferencia = hojeJaPassouDoHorario ? hoje : dateToKey(new Date(agora.getTime() - 86400000));

    const diff = Math.floor((new Date(dataReferencia + 'T12:00:00') - new Date(dataInicio + 'T12:00:00')) / 86400000) + 1;
    return Math.min(Math.max(diff, 0), TOTAL);
  })();

  const diasCertos  = Object.values(historico).filter(e => e?.tomou && e?.noHorarioCerto !== false).length;
  const diasPerdidos = Math.max(0, diasPassados - totalTomou);
  const diasErrados  = Math.max(0, totalTomou - diasCertos);
  const consistencia = diasPassados > 0 ? Math.round((diasCertos / diasPassados) * 100) : 0;

  const dots = Array.from({ length: TOTAL }, (_, i) => {
    const angle = (i / TOTAL) * 2 * Math.PI - Math.PI / 2;
    const x = R + Math.cos(angle) * (R - DOT) - DOT / 2;
    const y = R + Math.sin(angle) * (R - DOT) - DOT / 2;
    const key = getDayKey(i + 1);
    const tomou = !!historico[key]?.tomou;
    
    // Lógica para cor do dot: só fica vermelho se o dia já passou do horário limite
    const agora = new Date();
    if (!horario) {
      return { x, y, cor: key < hoje ? '#ff4444' : tema.border };
    }
    const [h, m] = horario.split(':').map(Number);
    const limiteHoje = new Date();
    limiteHoje.setHours(h, m + JANELA_TOLERANCIA_MIN, 0, 0);
    
    const ehHoje = key === hoje;
    const futuro = key > hoje;
    const jaPassouLimite = ehHoje ? (agora > limiteHoje) : !futuro;

    let cor = tema.border;
    if (tomou) cor = tema.primary;
    else if (jaPassouLimite) cor = '#ff4444';
    return { x, y, cor };
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
        <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: R, borderWidth: 1, borderColor: tema.border }} />
        {dots.map((d, i) => (
          <View key={i} style={{
            position: 'absolute', left: d.x, top: d.y,
            width: DOT, height: DOT, borderRadius: DOT / 2,
            backgroundColor: d.cor,
          }} />
        ))}
        <View style={{
          position: 'absolute',
          top: SIZE * 0.25, left: SIZE * 0.25,
          width: SIZE * 0.5, height: SIZE * 0.5,
          borderRadius: SIZE * 0.25,
          backgroundColor: tema.card,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: tema.primary, fontSize: 11, fontWeight: '900' }}>{consistencia}%</Text>
        </View>
      </View>
      <View>
        <Text style={{ color: tema.text, fontSize: 13, fontWeight: '700' }}>{totalTomou}/30 dias</Text>
        <Text style={{ color: tema.sub, fontSize: 11, marginTop: 2 }}>consistência: {consistencia}%</Text>
        {diasPerdidos > 0 && <Text style={{ color: '#ff4444', fontSize: 10, marginTop: 1 }}>❌ {diasPerdidos} perdido{diasPerdidos > 1 ? 's' : ''}</Text>}
        {diasErrados > 0 && <Text style={{ color: '#ffd60a', fontSize: 10, marginTop: 1 }}>⚠️ {diasErrados} fora do horário</Text>}
      </View>
    </View>
  );
}

export default function App() {
  const [tela, setTela] = useState('splash');
  const [authUser, setAuthUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [casalId, setCasalId] = useState(null);
  const [parceiro, setParceiro] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [authNome, setAuthNome] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authErro, setAuthErro] = useState('');
  const [pairStep, setPairStep] = useState('menu');
  const [pairChave, setPairChave] = useState('');
  const [pairInput, setPairInput] = useState('');
  const [pairLoading, setPairLoading] = useState(false);
  const [codigoGerado, setCodigoGerado] = useState('');
  const [historico, setHistorico] = useState({});
  const [pausa, setPausa] = useState(null);
  const [pontos, setPontos] = useState({});
  const [dataInicio, setDataInicio] = useState(null);
  const [fotos, setFotos] = useState({});
  const [temaAtualId, setTemaAtualId] = useState('roxo');
  const [tema, setTemaState] = useState(TEMAS_BASE.roxo);
  const [sugestao, setSugestao] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('home');
  // ── FIX SWIPE: ref para sempre ter o valor atual da aba ──
  const abaAtivaRef = useRef('home');
  const [adminUsers, setAdminUsers] = useState([]);
  const [casalConfig, setCasalConfig] = useState({});
  const [antrix, setAntrix] = useState(0);
  const [indPontos, setIndPontos] = useState(0);
  const [streak, setStreak] = useState(0);
  const [itensComprados, setItensComprados] = useState({ temas: [], selos: [], molduras: [] });
  const [seloEquipado, setSeloEquipado] = useState(null);
  const [molduraEquipada, setMolduraEquipada] = useState(null);
  const [titulosDesbloqueados, setTitulosDesbloqueados] = useState({});
  const [tituloEquipado, setTituloEquipado] = useState(null);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState({});
  const [estatisticas, setEstatisticas] = useState({
    rankPrimeiro: 0, rankPrimeiroConsecutivo: 0, antrixTotal: 0,
    totalTemasComprados: 0, totalTemasRarosComprados: 0, totalTemasLendariosComprados: 0,
    totalSelosComprados: 0, totalMoldurasCompradas: 0,
    tomadasHorarioPerfeito: 0, temasDiferentesUsados: new Set(),
    loginStreak: 0, diasSemErroHorario: 0, antrixSemGastar: 0,
  });
  const [mensagensMural, setMensagensMural] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [globalRanking, setGlobalRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [modalRanking, setModalRanking] = useState(false);
  const [modalLoja,   setModalLoja]   = useState(false);
  const [modalSelo,   setModalSelo]   = useState(false);
  const [inputAmor64, setInputAmor64] = useState('');
  const tituloAnim = useRef(new Animated.Value(0)).current;
  const tituloGlow = useRef(new Animated.Value(0)).current;
  const [modalMoldura, setModalMoldura] = useState(false);
  const [modalTitulo, setModalTitulo] = useState(false);
  const [otaInfo, setOtaInfo] = useState(null);
  const [modalOta, setModalOta] = useState(false);
  const [otaProgress, setOtaProgress] = useState(0);
  const versaoIgnoradaRef = useRef(null);
  const [pickerMes, setPickerMes] = useState(new Date().getMonth());
  const [pickerDia, setPickerDia] = useState(1);
  const [calMes, setCalMes] = useState(new Date().getMonth());
  const [calAno, setCalAno] = useState(new Date().getFullYear());
  const [modalAmor, setModalAmor] = useState(false);
  const [modalTema, setModalTema] = useState(false);
  const [modalAdmin, setModalAdmin] = useState(false);
  const [modalInicio, setModalInicio] = useState(false);
  const [modalGenero, setModalGenero] = useState(false);
  const [modalHorario, setModalHorario] = useState(false);
  const [horarioInput, setHorarioInput] = useState('');
  const [horarioHH, setHorarioHH] = useState('20');
  const [horarioMM, setHorarioMM] = useState('30');
  const [modalConectar, setModalConectar] = useState(false);
  const [modalRelatorio, setModalRelatorio] = useState(false);
  const [relatorioAtual, setRelatorioAtual] = useState(null);
  const [historicoRelatorios, setHistoricoRelatorios] = useState([]);
  const [fcmToken, setFcmToken] = useState(null);

  // Estados para papel do homem
  const [escudosDisponiveis, setEscudosDisponiveis] = useState(2);
  const [ultimoApoio, setUltimoApoio] = useState(null); // data "YYYY-MM-DD" do último apoio

  // ── Estados do Sistema de Pet ──────────────────────────────────
  const [pet, setPet] = useState(null); // null = sem pet
  const [modalPet, setModalPet] = useState(false);
  const [modalCaixas, setModalCaixas] = useState(false);
  const [modalTransferirPet, setModalTransferirPet] = useState(false);
  const [itemExploradoPendente, setItemExploradoPendente] = useState(null);
  const [modalItemExplorado, setModalItemExplorado] = useState(false);
  // Easter egg sombrio — rastreia sequência de abas
  const easterEggSequencia = useRef([]);
  const easterEggTimer = useRef(null);
  // Animação do pet
  const petFloat = useRef(new Animated.Value(0)).current;
  const petOrbit = useRef(new Animated.Value(0)).current;
  const petScale = useRef(new Animated.Value(1)).current;

  const fadeAmor = useRef(new Animated.Value(0)).current;
  const pulseBtn = useRef(new Animated.Value(1)).current;
  const [modalPerfilUsuario, setModalPerfilUsuario] = useState(false);
  const [perfilUsuarioVisto, setPerfilUsuarioVisto] = useState(null);
  const [confete, setConfete] = useState(false);

  // alpha 0.0.18: Countdown dinâmico baseado no horário da dupla (± JANELA_TOLERANCIA_MIN)
  const [countdown, setCountdown] = useState('');
  const [naJanela, setNaJanela] = useState(false);
  useEffect(() => {
    const tick = () => {
      const horariosDoCalsal = casalConfig?.horariosNotificacao || {};
      const ehMulherLocal = perfil?.genero === 'mulher';
      const horarioRef = ehMulherLocal
        ? (perfil?.horarioPessoal || null)
        : (Object.values(horariosDoCalsal)[0] || null);
      if (!horarioRef) {
        setCountdown('⏰ Defina o horário da rotina');
        setNaJanela(false);
        return;
      }
      const [hRef, mRef] = horarioRef.split(':').map(Number);
      const agora = new Date();
      const totalSeg = agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds();
      const centroDaSeg = hRef * 3600 + mRef * 60;
      const tolerSeg = JANELA_TOLERANCIA_MIN * 60;
      const inicioSeg = centroDaSeg - tolerSeg;
      const fimSeg    = centroDaSeg + tolerSeg;
      if (totalSeg >= inicioSeg && totalSeg <= fimSeg) {
        const restante = fimSeg - totalSeg;
        const mm = Math.floor(restante / 60);
        const ss = String(restante % 60).padStart(2, '0');
        setCountdown(`🟢 Janela aberta! Fecha em ${mm}:${ss}`);
        setNaJanela(true);
      } else {
        setNaJanela(false);
        let alvo = new Date();
        alvo.setHours(hRef, mRef - JANELA_TOLERANCIA_MIN, 0, 0);
        if (alvo <= agora) alvo.setDate(alvo.getDate() + 1);
        const diff = Math.floor((alvo - agora) / 1000);
        const hh = Math.floor(diff / 3600);
        const mm = Math.floor((diff % 3600) / 60);
        const ss = String(diff % 60).padStart(2, '0');
        setCountdown(`⏳ Janela em ${hh}h ${mm}m ${ss}s`);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [perfil?.horarioPessoal, perfil?.genero, casalConfig]);

  // ── FIX SWIPE: 8 abas (removido 'conectar') ──
  const ABAS = ['home', 'calendario', 'ranking', 'conquistas', 'mural', 'sugestoes', 'perfil'];

  // ── FIX SWIPE: PanResponder usa ref para aba atual ──
  const slideAnim    = useRef(new Animated.Value(0)).current; // mantido para compatibilidade
  const fadeTabAnim  = useRef(new Animated.Value(1)).current; // mantido para compatibilidade

  // alpha 0.0.16: swipe que acompanha o dedo em tempo real (estilo Android)
  const swipeX = useRef(new Animated.Value(0)).current;

  function trocarAba(nova, direcao = 1) {
    abaAtivaRef.current = nova;
    setAbaAtiva(nova);
    // Entra do lado correto e desliza para 0
    swipeX.setValue(direcao * SW);
    Animated.spring(swipeX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderMove: (_, g) => {
        // Acompanha o dedo em tempo real com resistência nas bordas
        const idx = ABAS.indexOf(abaAtivaRef.current);
        const naEsquerda = idx === 0 && g.dx > 0;
        const naDireita  = idx === ABAS.length - 1 && g.dx < 0;
        if (naEsquerda || naDireita) {
          swipeX.setValue(g.dx * 0.2); // resistência na borda
        } else {
          swipeX.setValue(g.dx);
        }
      },
      onPanResponderRelease: (_, g) => {
        const idx = ABAS.indexOf(abaAtivaRef.current);
        if (g.dx < -50 && Math.abs(g.vx) > 0.1 && idx < ABAS.length - 1) {
          trocarAba(ABAS[idx + 1], 1);
        } else if (g.dx > 50 && Math.abs(g.vx) > 0.1 && idx > 0) {
          trocarAba(ABAS[idx - 1], -1);
        } else {
          // Volta para o lugar com spring
          Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
      },
    })
  ).current;

  const hoje    = todayKey();
  const isAdmin = perfil?.isAdmin === true;
  const s       = makeStyles(tema);
  const listenersRef = useRef([]);

  // Mantém ref sincronizado com state
  useEffect(() => { abaAtivaRef.current = abaAtiva; }, [abaAtiva]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setAuthUser(user);
          await carregarPerfil(user.uid);
          // XP diário ao abrir app (1x por dia)
          const hoje = todayKey();
          const snapUltimoLogin = await get(ref(db, `usuarios/${user.uid}/ultimoLoginXP`));
          if (!snapUltimoLogin.exists() || snapUltimoLogin.val() !== hoje) {
            await set(ref(db, `usuarios/${user.uid}/ultimoLoginXP`), hoje);
            // darXpAoPet chamado após carregarPerfil (pet já estará no state)
            setTimeout(async () => {
              // re-lê pet do Firebase para garantir estado atualizado
              const snapPet = await get(ref(db, `usuarios/${user.uid}/pet`));
              if (snapPet.exists()) {
                const petAtual = snapPet.val();
                const novoPet = calcularFasePet({ ...petAtual, xp: (petAtual.xp || 0) + 10 });
                await update(ref(db, `usuarios/${user.uid}/pet`), { xp: novoPet.xp, fase: novoPet.fase });
                setPet(novoPet);
              }
            }, 2000);
          }
        }
        else { resetEstado(); setTela('auth'); }
      } catch(e) { setTela('auth'); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const r = ref(db, 'config');
    const unsub = onValue(r, snap => {
      const cfg = snap.val();
      if (!cfg?.versao || !cfg?.apkUrl) return;
      setOtaInfo(cfg);
      if (versaoMaior(cfg.versao, VERSAO_ATUAL)) {
        const ignorada = versaoIgnoradaRef.current;
        if (cfg.forcarAtualizar || ignorada !== cfg.versao) setModalOta(true);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseBtn, { toValue: 1.05, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseBtn, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]));
    pulse.start(); return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (casalId) {
      iniciarListeners(casalId);
      return () => pararListeners();
    } else if (authUser) {
      // Modo solo: carrega historico e dataInicio do usuario
      iniciarListenersSolo(authUser.uid);
      return () => pararListeners();
    }
  }, [casalId, authUser]);

  // alpha 0.0.16: marca automaticamente dias perdidos após fim da pausa
  // Se passou do fim da pausa e não tomou no dia seguinte até 00:00, marca falta
  useEffect(() => {
    if (!casalId || !pausa?.fim || !dataInicio) return;
    const fimPausa = pausa.fim; // "YYYY-MM-DD"
    const diaApos  = addDias(fimPausa, 1); // primeiro dia que deve tomar de novo
    if (hoje <= fimPausa) return; // ainda em pausa ou hoje é o último dia
    // Verifica cada dia a partir do diaApos até ontem
    const verificarFaltas = async () => {
      let cur = diaApos;
      const ontem = addDias(hoje, -1);
      while (cur <= ontem) {
        if (!historico[cur] && cur >= dataInicio) {
          // Dia perdido — marca como não tomado no histórico
          await set(ref(db, `casais/${casalId}/historico/${cur}`), {
            data: cur, hora: null, tomou: false, quemMarcou: null, faltaAutomatica: true,
          });
        }
        cur = addDias(cur, 1);
      }
    };
    verificarFaltas();
  }, [casalId, pausa?.fim, historico, hoje]);

  // Animação leve contínua do título secreto (brilho pulsante ao redor)
  useEffect(() => {
    const glow = Animated.loop(Animated.sequence([
      Animated.timing(tituloGlow, { toValue: 1, duration: 1400, useNativeDriver: true }),
      Animated.timing(tituloGlow, { toValue: 0, duration: 1400, useNativeDriver: true }),
    ]));
    glow.start();
    return () => glow.stop();
  }, []);

  // Animação flutuante do pet
  useEffect(() => {
    if (!pet) return;
    const float = Animated.loop(Animated.sequence([
      Animated.timing(petFloat, { toValue: -8, duration: 1200, useNativeDriver: true }),
      Animated.timing(petFloat, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]));
    float.start();
    return () => float.stop();
  }, [pet]);

  // Animação orbital do pet (órbita ao redor da foto)
  useEffect(() => {
    if (!pet) return;
    const orbit = Animated.loop(
      Animated.timing(petOrbit, { toValue: 1, duration: 8000, useNativeDriver: true })
    );
    orbit.start();
    return () => orbit.stop();
  }, [pet]);

  function resetEstado() {
    setHistorico({}); setPausa(null); setPontos({});
    setDataInicio(null); setFotos({}); setCasalId(null); setPerfil(null); setCasalConfig({});
    setAntrix(0); setIndPontos(0); setStreak(0);
    setItensComprados({ temas: [], selos: [], molduras: [] });
    setSeloEquipado(null); setMolduraEquipada(null);
    setTitulosDesbloqueados({}); setTituloEquipado(null);
    setConquistasDesbloqueadas({});
    setPet(null);
    easterEggSequencia.current = [];
  }

  async function carregarPerfil(uid) {
    try {
      const snap = await get(ref(db, `usuarios/${uid}`));
      if (!snap.exists()) { setTela('auth'); return; }
      const p = snap.val();
      setPerfil({ ...p, uid });
      // Restaura foto salva no perfil do usuário
      if (p.fotoPerfil) {
        setFotos(prev => ({ ...prev, [uid]: p.fotoPerfil }));
      }
      setAntrix(p.antrix || 0);
      setIndPontos(p.indPontos || 0);
      setStreak(p.streak || 0);
      setEscudosDisponiveis(p.escudosDisponiveis !== undefined ? p.escudosDisponiveis : 2);
      setUltimoApoio(p.ultimoApoio || null);
      // Carrega pet se existir
      if (p.pet) {
        setPet(p.pet);
        // Verifica morte por fome e itens de exploração pendentes
        setTimeout(() => {
          verificarMortePet(uid, p.pet);
          verificarExploracaoPet(uid, p.pet);
        }, 1000);
      }
      let itens = p.itensComprados || { temas: [], selos: [], molduras: [] };
      if (!itens.temas) itens.temas = [];
      if (!itens.selos) itens.selos = [];
      if (!itens.molduras) itens.molduras = [];
      setItensComprados(itens);
      setSeloEquipado(p.seloEquipado || null);
      setMolduraEquipada(p.molduraEquipada || null);
      setTitulosDesbloqueados(p.titulosDesbloqueados || {});
      setTituloEquipado(p.tituloEquipado || null);
      setConquistasDesbloqueadas(p.conquistas || {});
      if (p.estatisticas) {
        setEstatisticas({
          ...p.estatisticas,
          temasDiferentesUsados: new Set(p.estatisticas.temasDiferentesUsados || [])
        });
      }
      if (!p.genero) setModalGenero(true);
      if (p.casalId) {
        setCasalId(p.casalId); setTela('app');
        const tSnap = await get(ref(db, `casais/${p.casalId}/tema`));
        if (tSnap.exists()) aplicarTema(tSnap.val());
        carregarMural(p.casalId);
        // Registra token FCM assim que entra no app
        setTimeout(() => registrarFcmToken(), 1500);
      } else {
        setTela('app');
        carregarMuralPessoal(uid);
      }
    } catch(e) { setTela('auth'); }
  }

  function carregarMural(cid) {
    const muralRef = ref(db, `casais/${cid}/mural`);
    const q = query(muralRef, orderByChild('timestamp'), limitToLast(50));
    onValue(q, (snap) => {
      const msgs = [];
      snap.forEach(child => { msgs.push({ id: child.key, ...child.val() }); });
      const agora = Date.now();
      const filtradas = msgs.filter(m => (agora - m.timestamp) < 24 * 60 * 60 * 1000);
      setMensagensMural(filtradas.reverse());
    });
  }

  function carregarMuralPessoal(uid) {
    const muralRef = ref(db, `usuarios/${uid}/mural`);
    const q = query(muralRef, orderByChild('timestamp'), limitToLast(50));
    onValue(q, (snap) => {
      const msgs = [];
      snap.forEach(child => { msgs.push({ id: child.key, ...child.val() }); });
      const agora = Date.now();
      const filtradas = msgs.filter(m => (agora - m.timestamp) < 24 * 60 * 60 * 1000);
      setMensagensMural(filtradas.reverse());
    });
  }

  function iniciarListeners(cid) {
    try {
      ['historico', 'pausa', 'pontos', 'dataInicio', 'fotos', 'tema'].forEach(p => {
        const r = ref(db, `casais/${cid}/${p}`);
        const unsub = onValue(r, snap => {
          const val = snap.val();
          if (p === 'historico') setHistorico(val || {});
          if (p === 'pausa') setPausa(val);
          if (p === 'pontos' && val) setPontos(val);
          if (p === 'dataInicio' && val) setDataInicio(val);
          if (p === 'fotos' && val) setFotos(val);
          if (p === 'tema' && val) aplicarTema(val);
        });
        listenersRef.current.push({ r, unsub });
      });
      const cfgRef = ref(db, `casais/${cid}/config`);
      const cfgUnsub = onValue(cfgRef, snap => {
        if (snap.exists()) {
          const cfg = snap.val();
          setCasalConfig(cfg);
          // Reagenda notificações automaticamente se horariosNotificacao mudar
          // (ex: parceira salvou horário novo → app do parceiro reagenda na hora)
          configurarAlarmes(cid);
        }
      });
      listenersRef.current.push({ r: cfgRef, unsub: cfgUnsub });
      const mRef = ref(db, `casais/${cid}/membros`);
      const mUnsub = onValue(mRef, snap => {
        const m = snap.val() || {};
        const ids = Object.keys(m).filter(id => id !== authUser?.uid);
        if (ids.length > 0) setParceiro({ uid: ids[0], nome: m[ids[0]] });
      });
      listenersRef.current.push({ r: mRef, unsub: mUnsub });
      if (perfil?.isAdmin) {
        const uRef = ref(db, 'usuarios');
        const uUnsub = onValue(uRef, snap => {
          const u = snap.val() || {};
          setAdminUsers(Object.entries(u).map(([uid, d]) => ({ uid, ...d })));
        });
        listenersRef.current.push({ r: uRef, unsub: uUnsub });
      }
      configurarAlarmes(cid);
    } catch(e) { console.error('Listener Error:', e); }
  }

  function iniciarListenersSolo(uid) {
    pararListeners();
    const paths = ['historico', 'dataInicio', 'pausa'];
    paths.forEach(p => {
      const r = ref(db, `usuarios/${uid}/solo/${p}`);
      const unsub = onValue(r, snap => {
        const val = snap.val();
        if (p === 'historico') setHistorico(val || {});
        if (p === 'dataInicio' && val) setDataInicio(val);
        if (p === 'pausa') setPausa(val);
      });
      listenersRef.current.push({ r, unsub });
    });
  }

  function pararListeners() {
    listenersRef.current.forEach(({ r, unsub }) => { try { off(r); if (unsub) unsub(); } catch(e) {} });
    listenersRef.current = [];
  }

  function aplicarTema(idOuNome) {
    const id = typeof idOuNome === 'string' ? idOuNome : idOuNome?.id;
    if (!id) return;
    // Primeiro tenta nos TEMAS_BASE
    if (TEMAS_BASE[id]) {
      setTemaState(TEMAS_BASE[id]);
      setTemaAtualId(id);
      return;
    }
    const temaEncontrado = getTemaById(id);
    if (temaEncontrado) {
      const newTheme = { ...TEMAS_BASE.roxo, primary: temaEncontrado.cor };
      setTemaState(newTheme);
      setTemaAtualId(id);
    } else {
      setTemaState(TEMAS_BASE.roxo);
      setTemaAtualId('roxo');
    }
  }

  async function salvarTema(id) {
    try {
      await set(ref(db, `casais/${casalId}/tema`), id);
      aplicarTema(id);
      setModalTema(false);
    } catch(e) { Alert.alert('Erro', 'Não foi possível salvar o tema.'); }
  }

  // Registra FCM token no Firebase para receber push mesmo com app fechado
  async function registrarFcmToken() {
    try {
      if (!Device.isDevice) return null;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return null;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '5433fd20-8302-4bb6-9834-e6e6255d0d2b',
      });
      const token = tokenData.data;
      setFcmToken(token);
      if (authUser?.uid) {
        await update(ref(db, `usuarios/${authUser.uid}`), { fcmToken: token });
      }
      return token;
    } catch(e) { console.warn('FCM token error:', e); return null; }
  }

  // Envia push via FCM REST para um token específico
  async function enviarPushFcm(toToken, titulo, corpo) {
    if (!toToken) return;
    try {
      // Busca server key do Firebase (nunca no código!)
      const keySnap = await get(ref(db, 'config/fcmServerKey'));
      const serverKey = keySnap.exists() ? keySnap.val() : null;
      if (!serverKey) { console.warn('FCM server key não encontrada em /config/fcmServerKey'); return; }
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `key=${serverKey}` },
        body: JSON.stringify({
          to: toToken,
          notification: { title: titulo, body: corpo, sound: 'default' },
          priority: 'high',
        }),
      });
    } catch(e) { console.warn('Erro ao enviar FCM push:', e); }
  }

  // ── alpha 0.0.15: configurarAlarmes ──────────────────────────────────────────
  // Lógica de notificação por casal:
  //   · Cada mulher salva seu horário em /usuarios/{uid}/horarioPessoal
  //   · Ao salvar/parear, horários das mulheres do casal vão pra
  //     /casais/{cid}/config/horariosNotificacao (objeto { uid: "HH:MM", ... })
  //   · configurarAlarmes lê esses horários e agenda uma notificação local
  //     para CADA horário — todos os membros do casal recebem igual
  //   · Homem não tem horário próprio: só recebe via casal
  // ─────────────────────────────────────────────────────────────────────────────
  async function configurarAlarmes(cid) {
    try {
      if (!Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Notifications.cancelAllScheduledNotificationsAsync();

      // alpha 0.0.18: verifica se o parceiro desta dupla é o admin (email fixo)
      // Se sim → notificações especiais; caso contrário → genéricas
      let temNotifEspecial = false;
      try {
        const membrosSnap = await get(ref(db, `casais/${cid}/membros`));
        if (membrosSnap.exists()) {
          const membrosUids = Object.keys(membrosSnap.val()).filter(u => u !== authUser?.uid);
          for (const uid of membrosUids) {
            const emailSnap = await get(ref(db, `usuarios/${uid}/email`));
            if (emailSnap.exists() && emailSnap.val().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
              temNotifEspecial = true; break;
            }
          }
          // Também vale se o próprio usuário for o admin (ele recebe notif especial para si)
          if (!temNotifEspecial && perfil?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            temNotifEspecial = true;
          }
        }
      } catch(_) {}

      // Busca todos os horários registrados no casal
      const cfgSnap = await get(ref(db, `casais/${cid}/config/horariosNotificacao`));
      const horariosObj = cfgSnap.exists() ? cfgSnap.val() : {};
      // Deduplica horários (caso 2 mulheres tenham o mesmo)
      const horarios = [...new Set(Object.values(horariosObj))].filter(h => /^\d{2}:\d{2}$/.test(h));

      // Agenda uma notificação local para cada horário do casal
      for (let i = 0; i < horarios.length; i++) {
        const h = horarios[i];
        const [hh, mm] = h.split(':').map(Number);
        await Notifications.scheduleNotificationAsync({
          identifier: `lembrete_casal_${i}`,
          content: {
            title: temNotifEspecial ? '💊 Hora da rotina, meu amor!' : '💊 Hora da sua rotina!',
            body: temNotifEspecial ? `São ${h} — não esquece de tomar, meu amor! 💕` : `São ${h} — hora da sua rotina! 💊`,
            sound: true,
          },
          trigger: { hour: hh, minute: mm, repeats: true },
        });
      }

      // alpha 0.0.18: notificação de alerta 5 min antes do fim da janela (dinâmica)
      for (let i = 0; i < horarios.length; i++) {
        const h = horarios[i];
        const [hh2, mm2] = h.split(':').map(Number);
        // Calcula minuto do fechamento da janela
        const fimMin = mm2 + JANELA_TOLERANCIA_MIN;
        const fimHH = fimMin >= 60 ? hh2 + 1 : hh2;
        const fimMM = fimMin >= 60 ? fimMin - 60 : fimMin;
        // Alerta 5 min antes do fechamento = início - 5 min
        const alertaMM = mm2 - JANELA_TOLERANCIA_MIN + JANELA_TOLERANCIA_MIN - 5; // = mm2 - 5
        const alertaMin = mm2 - 5 < 0 ? 60 + (mm2 - 5) : mm2 - 5;
        const alertaHH  = mm2 - 5 < 0 ? hh2 - 1 : hh2;
        const alertaTxt = temNotifEspecial
          ? '⚠️ Janela fechando em breve, meu amor! 💕'
          : '⚠️ Janela da rotina fechando em 5 min!';
        await Notifications.scheduleNotificationAsync({
          identifier: `janela_alerta_${i}`,
          content: { title: '⚠️ Quase no horário!', body: alertaTxt, sound: true },
          trigger: { hour: alertaHH < 0 ? 23 : alertaHH, minute: alertaMin, repeats: true },
        });
      }
    } catch(e) { console.warn("Erro notificações:", e); }
  }

  // Ao marcar a pílula: envia push FCM real pro parceiro
  async function notificarParceiro(horaMarcado) {
    if (!casalId || !parceiro) return;
    try {
      // Busca token FCM e email do parceiro
      const parceiroSnap = await get(ref(db, `usuarios/${parceiro.uid}`));
      const parceiroData = parceiroSnap.exists() ? parceiroSnap.val() : {};
      const tokenParceiro = parceiroData.fcmToken || null;
      const nomeMeu = perfil?.nome || 'Seu parceiro(a)';
      // alpha 0.0.18: mensagem especial se o parceiro for o admin (email fixo)
      const parceiroEhAdmin = (parceiroData.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const pushBody = parceiroEhAdmin
        ? `${nomeMeu} tomou às ${horaMarcado}! Orgulho de você, meu amor! ✅💕`
        : `${nomeMeu} completou a rotina às ${horaMarcado}! ✅`;
      await enviarPushFcm(tokenParceiro, '✅ Rotina concluída!', pushBody);
    } catch(e) { console.warn('notificarParceiro error:', e); }
  }

  async function fazerLogin() {
    setAuthLoading(true); setAuthErro('');
    try { const cred = await signInWithEmailAndPassword(auth, authEmail.trim(), authSenha); setAuthUser(cred.user); await carregarPerfil(cred.user.uid); }
    catch(e) { setAuthErro('Erro: ' + (e?.message || JSON.stringify(e))); }
    setAuthLoading(false);
  }

  async function fazerCadastro() {
    if (!authNome.trim()) { setAuthErro('Coloca seu nome!'); return; }
    if (authSenha.length < 6) { setAuthErro('Senha curta demais.'); return; }
    setAuthLoading(true); setAuthErro('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authSenha);
      await updateProfile(cred.user, { displayName: authNome.trim() });
      const isHarlley = authEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const conquistaBoasVindas = { desbloqueada: true, data: new Date().toISOString() };
      await set(ref(db, `usuarios/${cred.user.uid}`), {
        nome: authNome.trim(), email: authEmail.trim().toLowerCase(),
        isAdmin: isHarlley, casalId: null, genero: null,
        criadoEm: new Date().toISOString(),
        antrix: 10, indPontos: 0, streak: 0,
        itensComprados: { temas: [], selos: [], molduras: [] },
        seloEquipado: null, molduraEquipada: null,
        titulosDesbloqueados: {}, tituloEquipado: null,
        conquistas: { boas_vindas: conquistaBoasVindas },
        estatisticas: {
          rankPrimeiro: 0, rankPrimeiroConsecutivo: 0, antrixTotal: 0,
          totalTemasComprados: 0, totalTemasRarosComprados: 0, totalTemasLendariosComprados: 0,
          totalSelosComprados: 0, totalMoldurasCompradas: 0,
          tomadasHorarioPerfeito: 0, temasDiferentesUsados: [],
          loginStreak: 0, diasSemErroHorario: 0, antrixSemGastar: 0,
        }
      });
    setAuthUser(cred.user);
    // Dar conquista boas_vindas automaticamente
    try {
      const conquBV = { desbloqueada: true, data: new Date().toISOString() };
      await update(ref(db, `usuarios/${cred.user.uid}/conquistas/boas_vindas`), conquBV);
    } catch(e2) {}
    // alpha 0.0.27: dar conquista criar_conta também no cadastro
    try {
      const conquCC = { desbloqueada: true, data: new Date().toISOString() };
      await update(ref(db, `usuarios/${cred.user.uid}/conquistas/criar_conta`), conquCC);
    } catch(e3) {}
    await carregarPerfil(cred.user.uid);
    } catch(e) {
      let msg = 'Erro no cadastro.';
      if (e.code === 'auth/email-already-in-use') msg = 'Este email já está em uso.';
      if (e.code === 'auth/invalid-email') msg = 'Email inválido.';
      if (e.code === 'auth/weak-password') msg = 'Senha muito fraca.';
      setAuthErro(msg);
    }
    setAuthLoading(false);
  }

  // ── PAPEL DO HOMEM: Apoio diário ─────────────────────────────────────────────
  async function enviarApoioDiario() {
    if (ultimoApoio === hoje) { Alert.alert('💜', 'Você já apoiou hoje!'); return; }
    if (!casalId) { Alert.alert('Conecte-se', 'Paire com sua parceira primeiro.'); return; }
    try {
      // Registra apoio no Firebase
      await push(ref(db, `casais/${casalId}/apoios`), {
        uid: authUser.uid,
        nome: perfil?.nome,
        data: hoje,
        timestamp: Date.now(),
      });
      // Bônus de Antrix por apoio
      const bonus = 3;
      const novoAntrix = antrix + bonus;
      await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix, ultimoApoio: hoje });
      setAntrix(novoAntrix);
      setUltimoApoio(hoje);
      Alert.alert('💜 Apoio enviado!', `Sua parceira foi notificada!\n+${bonus} Antrix para você.`);
    } catch(e) { Alert.alert('Erro', 'Falha ao enviar apoio.'); }
  }

  // ── PAPEL DO HOMEM: Usar escudo para proteger streak dela ────────────────────
  async function usarEscudoStreak() {
    if (escudosDisponiveis <= 0) {
      Alert.alert('Sem escudos', 'Você não tem escudos disponíveis.\nGanhe mais completando missões.');
      return;
    }
    if (!casalId) { Alert.alert('Conecte-se', 'Paire com sua parceira primeiro.'); return; }
    Alert.alert(
      '🛡️ Usar Escudo?',
      `Você tem ${escudosDisponiveis} escudo(s). Usar 1 escudo protegerá o streak da sua parceira por hoje.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Usar Escudo', onPress: async () => {
          try {
            const novosEscudos = escudosDisponiveis - 1;
            await update(ref(db, `usuarios/${authUser.uid}`), { escudosDisponiveis: novosEscudos });
            // Marca escudo ativo no casal
            await set(ref(db, `casais/${casalId}/escudoAtivo`), { data: hoje, usadoPor: authUser.uid, uid: authUser.uid });
            setEscudosDisponiveis(novosEscudos);
            Alert.alert('🛡️ Escudo ativado!', 'O streak dela está protegido hoje!');
          } catch(e) { Alert.alert('Erro', 'Falha ao usar escudo.'); }
        }}
      ]
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SISTEMA DE PET
  // ══════════════════════════════════════════════════════════════

  function calcularEnergiaAtual(petData) {
    if (!petData) return 0;
    const agora = Date.now();
    const horasPassadas = (agora - (petData.ultimaRefeicao || agora)) / (1000 * 60 * 60);
    const decaimento = Math.floor(horasPassadas / 6) * 5;
    return Math.max(0, (petData.energia || 100) - decaimento);
  }

  async function verificarMortePet(uid, petData) {
    if (!petData) return;
    const agora = Date.now();
    const diasSemComer = (agora - (petData.ultimaRefeicao || agora)) / (1000 * 60 * 60 * 24);
    if (diasSemComer >= 2) {
      // Pet morre — remove do Firebase e limpa estado
      await remove(ref(db, `usuarios/${uid}/pet`));
      setPet(null);
      Alert.alert('💔 Seu pet morreu...', 'Faz 2 dias sem comer. Abra uma nova caixa para ter um pet novamente.');
    }
  }

  async function verificarExploracaoPet(uid, petData) {
    if (!petData) return;
    // Verifica se tem item explorado pendente
    if (petData.itemExplorado) {
      setItemExploradoPendente(petData.itemExplorado);
      setModalItemExplorado(true);
      return;
    }
    // Verifica se pode sair explorar agora (a cada 4h, energia ≥ 50)
    const agora = Date.now();
    const horasDesdExploracao = (agora - (petData.ultimaExploracao || 0)) / (1000 * 60 * 60);
    const energiaAtual = calcularEnergiaAtual(petData);
    if (horasDesdExploracao >= 4 && energiaAtual >= 50) {
      // Pet saiu explorar — sorteia item
      const chances = [70, 20, 7, 2, 1]; // comum, incomum, raro, épico, lendário
      const roll = Math.random() * 100;
      let idx = 0;
      let acc = 0;
      for (let i = 0; i < chances.length; i++) {
        acc += chances[i];
        if (roll < acc) { idx = i; break; }
      }
      const item = PET_ITENS_EXPLORACAO[idx];
      const itemComTimestamp = { ...item, timestamp: agora };
      await update(ref(db, `usuarios/${uid}/pet`), {
        ultimaExploracao: agora,
        itemExplorado: itemComTimestamp,
      });
      setPet(prev => prev ? { ...prev, ultimaExploracao: agora, itemExplorado: itemComTimestamp } : prev);
    }
  }

  async function coletarItemExploracao() {
    if (!itemExploradoPendente || !authUser) return;
    const bonus = itemExploradoPendente.antrixBonus || 0;
    const xpBonus = itemExploradoPendente.xpBonus || 0;
    // Aplica recompensas
    const novoAntrix = antrix + bonus;
    setAntrix(novoAntrix);
    await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
    // Adiciona XP ao pet
    const novoPet = { ...pet, xp: (pet.xp || 0) + xpBonus, itemExplorado: null };
    const petComFase = calcularFasePet(novoPet);
    setPet(petComFase);
    await update(ref(db, `usuarios/${authUser.uid}/pet`), { xp: petComFase.xp, fase: petComFase.fase, itemExplorado: null });
    setItemExploradoPendente(null);
    setModalItemExplorado(false);
    Alert.alert('🎒 Item coletado!', `Seu pet voltou com: ${itemExploradoPendente.nome}!
+${xpBonus} XP · +${bonus} Antrix`);
  }

  function calcularFasePet(petData) {
    if (!petData) return petData;
    const xp = petData.xp || 0;
    let novaFase = 1;
    for (let i = PET_FASES.length - 1; i >= 1; i--) {
      if (PET_FASES[i] && xp >= PET_FASES[i].xpNecessario) {
        novaFase = i;
        break;
      }
    }
    return { ...petData, fase: novaFase };
  }

  async function darXpAoPet(xp, motivo) {
    if (!pet || !authUser) return;
    const novoPet = calcularFasePet({ ...pet, xp: (pet.xp || 0) + xp });
    const faseMudou = novoPet.fase !== pet.fase;
    setPet(novoPet);
    await update(ref(db, `usuarios/${authUser.uid}/pet`), { xp: novoPet.xp, fase: novoPet.fase });
    if (faseMudou) {
      const faseInfo = PET_FASES[novoPet.fase];
      Alert.alert('🎉 Seu pet evoluiu!', `${pet.nome || 'Seu pet'} virou ${faseInfo?.nome || '???'} ${faseInfo?.emoji || ''}!

+200 Antrix de bônus!`);
      const novoAntrix = antrix + 200;
      setAntrix(novoAntrix);
      await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
    }
  }

  async function alimentarPet() {
    if (!pet || !authUser) return;
    if (antrix < 20) { Alert.alert('Antrix insuficiente', 'Comida custa 20 Antrix.'); return; }
    const agora = Date.now();
    const novoAntrix = antrix - 20;
    const novoPet = { ...pet, ultimaRefeicao: agora, energia: 100, humor: 'feliz' };
    setAntrix(novoAntrix);
    setPet(novoPet);
    await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
    await update(ref(db, `usuarios/${authUser.uid}/pet`), { ultimaRefeicao: agora, energia: 100, humor: 'feliz' });
    await darXpAoPet(20, 'comida');
    Alert.alert('😋 Que delícia!', 'Seu pet comeu e ficou feliz! +20 XP');
  }

  async function abrirCaixa(caixa) {
    if (antrix < caixa.preco) {
      Alert.alert('Antrix insuficiente', `Você tem ${antrix} Antrix. A caixa custa ${caixa.preco}.`);
      return;
    }
    if (pet) {
      Alert.alert('Você já tem um pet!', 'Transfira ou perca o pet atual antes de abrir uma nova caixa.');
      return;
    }
    const chances = PET_CAIXA_CHANCES[caixa.id] || ['fogo','agua','natureza'];
    const tipoSorteado = chances[Math.floor(Math.random() * chances.length)];
    const agora = Date.now();
    const novoPet = {
      tipo: tipoSorteado,
      fase: 1,
      xp: 0,
      energia: 100,
      humor: 'feliz',
      ultimaRefeicao: agora,
      ultimaExploracao: agora,
      itemExplorado: null,
      itens: {},
      bannerAtivo: tipoSorteado.startsWith('secreto') ? tipoSorteado.replace('secreto_','') : null,
      nome: null,
      criadoEm: agora,
    };
    const novoAntrix = antrix - caixa.preco;
    setAntrix(novoAntrix);
    setPet(novoPet);
    await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
    await set(ref(db, `usuarios/${authUser.uid}/pet`), novoPet);
    const tipoInfo = PET_TIPOS[tipoSorteado];
    setModalCaixas(false);
    Alert.alert(
      '🎉 Você ganhou um pet!',
      `Um ovo misterioso ${tipoInfo?.secreto ? '🔮' : tipoInfo?.emoji || '🥚'} apareceu!
Cuide bem dele para ele evoluir!`
    );
  }

  async function transferirPet() {
    if (!pet || !casalId || !parceiro) {
      Alert.alert('Erro', 'Você precisa estar pareado para transferir um pet.');
      return;
    }
    Alert.alert(
      '🐾 Transferir Pet',
      `Tem certeza que quer dar seu pet para ${parceiro.nome}?
Ele sairá do seu perfil permanentemente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Transferir', onPress: async () => {
          try {
            // Salva pet no parceiro
            await set(ref(db, `usuarios/${parceiro.uid}/pet`), pet);
            // Remove do próprio perfil
            await remove(ref(db, `usuarios/${authUser.uid}/pet`));
            setPet(null);
            setModalTransferirPet(false);
            Alert.alert('💝 Pet transferido!', `Seu pet foi para ${parceiro.nome}!`);
          } catch(e) { Alert.alert('Erro', 'Falha ao transferir pet.'); }
        }}
      ]
    );
  }

  // ── Easter egg pet sombrio secreto ───────────────────────────
  // Sequência: navegar abas perfil→ranking→conquistas→mural→perfil→ranking→conquistas
  // em menos de 30 segundos. Disponível para homem E mulher.
  function checkEasterEgg(aba) {
    const SEQ = ['perfil','ranking','conquistas','mural','perfil','ranking','conquistas'];
    easterEggSequencia.current.push(aba);
    // Mantém só os últimos 7
    if (easterEggSequencia.current.length > 7) {
      easterEggSequencia.current = easterEggSequencia.current.slice(-7);
    }
    // Reset timer
    if (easterEggTimer.current) clearTimeout(easterEggTimer.current);
    easterEggTimer.current = setTimeout(() => {
      easterEggSequencia.current = [];
    }, 30000);
    // Verifica sequência
    if (JSON.stringify(easterEggSequencia.current) === JSON.stringify(SEQ)) {
      easterEggSequencia.current = [];
      desbloquearPetSombrio();
    }
  }

  async function desbloquearPetSombrio() {
    if (!authUser) return;
    if (pet?.tipo === 'secreto_sombrio') {
      Alert.alert('🖤', 'Você já tem o Pet Sombrio Secreto!');
      return;
    }
    const agora = Date.now();
    const petSombrio = {
      tipo: 'secreto_sombrio',
      fase: 1,
      xp: 0,
      energia: 100,
      humor: 'feliz',
      ultimaRefeicao: agora,
      ultimaExploracao: agora,
      itemExplorado: null,
      itens: {},
      bannerAtivo: 'sombrio',
      nome: null,
      criadoEm: agora,
    };
    // Se já tem pet, sobrescreve (easter egg é especial)
    await set(ref(db, `usuarios/${authUser.uid}/pet`), petSombrio);
    setPet(petSombrio);
    Alert.alert(
      '🖤 Easter Egg Descoberto!',
      'Você encontrou o Pet Sombrio Secreto!\nEle traz um banner exclusivo ao seu perfil...',
      [{ text: '🖤 Aceitar destino', style: 'default' }]
    );
  }

  // ── Pet fofo secreto — 28 dias streak + parceiro ativo ───────
  // Verificado em verificarTodasConquistas
  async function verificarPetFofoSecreto() {
    if (!authUser || pet?.tipo === 'secreto_fofo') return;
    if (streak < 28) return;
    if (!casalId) return;
    // Verifica se parceiro marcou hoje também
    const parceiroUid = parceiro?.uid;
    if (!parceiroUid) return;
    const snap = await get(ref(db, `usuarios/${parceiroUid}/pet`));
    const parceiroAtivo = snap.exists(); // parceiro tem pet = ativo
    if (!parceiroAtivo) return;
    const agora = Date.now();
    const petFofo = {
      tipo: 'secreto_fofo',
      fase: 1, xp: 0, energia: 100, humor: 'feliz',
      ultimaRefeicao: agora, ultimaExploracao: agora,
      itemExplorado: null, itens: {}, bannerAtivo: 'fofo',
      nome: null, criadoEm: agora,
    };
    await set(ref(db, `usuarios/${authUser.uid}/pet`), petFofo);
    setPet(petFofo);
    Alert.alert(
      '🌸 Pet Secreto Desbloqueado!',
      'Você encontrou o Pet Fofo Secreto!\nSeu perfil ganhou um banner especial! 🌸'
    );
  }

  async function fazerLogout() {
    try { pararListeners(); await signOut(auth); } catch(e) {}
    resetEstado();
  }

  async function criarCasal() {
    setPairLoading(true);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let chave = '';
      for (let i = 0; i < 6; i++) chave += chars[Math.floor(Math.random() * chars.length)];
      const id = `casal_${Date.now()}`;
      await set(ref(db, `casais/${id}`), { criadoEm: new Date().toISOString(), chave, membros: { [authUser.uid]: perfil.nome } });
      await set(ref(db, `pairCodes/${chave}`), { casalId: id });
      await set(ref(db, `usuarios/${authUser.uid}/casalId`), id);
      setPairChave(chave); setCasalId(id);
      // Migra dados solo para o novo casal
      await migrarDadosSoloParaCasal(authUser.uid, id);
      setPairStep('mostrarChave');
    } catch(e) { Alert.alert('Erro', 'Falha ao criar dupla.'); }
    setPairLoading(false);
  }

  async function entrarCasal() {
    const code = pairInput.trim().toUpperCase();
    if (code.length < 4) return;
    setPairLoading(true);
    try {
      const snap = await get(ref(db, `pairCodes/${code}`));
      if (snap.exists()) {
        const dados = snap.val();
        let cid = dados.casalId;

        // alpha 0.0.27: código pode ter sido gerado sem casal (só geradoPor)
        if (!cid && dados.geradoPor) {
          const uidCriador = dados.geradoPor;
          // Cria o casal agora com os dois membros
          cid = `casal_${Date.now()}`;
          const snapCriador = await get(ref(db, `usuarios/${uidCriador}`));
          const nomeCriador = snapCriador.exists() ? (snapCriador.val().nome || dados.nomeCriador || 'Usuário') : (dados.nomeCriador || 'Usuário');
          await set(ref(db, `casais/${cid}`), {
            criadoEm: new Date().toISOString(),
            membros: { [uidCriador]: nomeCriador, [authUser.uid]: perfil?.nome || 'Usuário' }
          });
          // Liga o casal nos dois perfis
          await set(ref(db, `usuarios/${uidCriador}/casalId`), cid);
          await set(ref(db, `usuarios/${authUser.uid}/casalId`), cid);
          // Se o criador for mulher com horário, copia pro casal
          if (snapCriador.exists()) {
            const pc = snapCriador.val();
            if (pc.genero === 'mulher' && pc.horarioPessoal) {
              await update(ref(db, `casais/${cid}/config/horariosNotificacao`), { [uidCriador]: pc.horarioPessoal });
            }
          }
        } else if (cid) {
          // Fluxo normal: casal já existe
          const membrosSnap = await get(ref(db, `casais/${cid}/membros`));
          const membrosAtuais = membrosSnap.exists() ? Object.keys(membrosSnap.val()) : [];
          if (membrosAtuais.length >= 2 && !membrosAtuais.includes(authUser.uid)) {
            Alert.alert('Dupla cheia', 'Esta dupla já tem 2 membros. Cada dupla aceita no máximo 2 pessoas.');
            setPairLoading(false); return;
          }
          await set(ref(db, `casais/${cid}/membros/${authUser.uid}`), perfil.nome);
          await set(ref(db, `usuarios/${authUser.uid}/casalId`), cid);
        } else {
          Alert.alert('Erro', 'Código inválido.');
          setPairLoading(false); return;
        }

        await remove(ref(db, `pairCodes/${code}`));
        // Se for mulher com horário salvo, copia para o casal agora
        if (perfil?.genero === 'mulher' && perfil?.horarioPessoal && cid) {
          await update(ref(db, `casais/${cid}/config/horariosNotificacao`), { [authUser.uid]: perfil.horarioPessoal });
        }
        // Migra dados solo para o casal
        await migrarDadosSoloParaCasal(authUser.uid, cid);
        setCasalId(cid); setTela('app'); setModalConectar(false);
      } else { Alert.alert('Erro', 'Chave não encontrada.'); }

    } catch(e) { Alert.alert('Erro', 'Falha ao entrar na dupla.'); }
    setPairLoading(false);
  }

  // ── Migração solo → casal ────────────────────────────────────────────────────
  // Copia historico, dataInicio e pausa de /usuarios/{uid}/solo para /casais/{cid}
  // Não sobrescreve entradas que já existem no casal
  async function migrarDadosSoloParaCasal(uid, cid) {
    try {
      const soloSnap = await get(ref(db, `usuarios/${uid}/solo`));
      if (!soloSnap.exists()) return; // nada para migrar
      const solo = soloSnap.val();

      // Migra dataInicio se o casal não tiver
      if (solo.dataInicio) {
        const casalDISnap = await get(ref(db, `casais/${cid}/dataInicio`));
        if (!casalDISnap.exists()) {
          await set(ref(db, `casais/${cid}/dataInicio`), solo.dataInicio);
        }
      }

      // Migra historico — só adiciona dias que não existem no casal
      if (solo.historico) {
        const casalHistSnap = await get(ref(db, `casais/${cid}/historico`));
        const casalHist = casalHistSnap.exists() ? casalHistSnap.val() : {};
        const updates = {};
        for (const [dia, entrada] of Object.entries(solo.historico)) {
          if (!casalHist[dia]) {
            updates[`casais/${cid}/historico/${dia}`] = entrada;
          }
        }
        if (Object.keys(updates).length > 0) {
          // update aceita múltiplos paths de uma vez
          await update(ref(db, '/'), updates);
        }
      }

      // Migra pausa se o casal não tiver pausa ativa
      if (solo.pausa?.ativa) {
        const casalPausaSnap = await get(ref(db, `casais/${cid}/pausa`));
        if (!casalPausaSnap.exists() || !casalPausaSnap.val()?.ativa) {
          await set(ref(db, `casais/${cid}/pausa`), solo.pausa);
        }
      }

      // Remove dados solo após migração
      await remove(ref(db, `usuarios/${uid}/solo`));
    } catch(e) {
      console.warn('Migração solo→casal falhou (não crítico):', e);
    }
  }

  async function gerarCodigoConvite() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let chave = '';
    for (let i = 0; i < 6; i++) chave += chars[Math.floor(Math.random() * chars.length)];
    try {
      // alpha 0.0.27: gera código sem criar casal automaticamente.
      // Se já tem casal, vincula ao casal existente. Se não tem, salva só o uid
      // para que quando a parceira entrar com o código, ela crie o casal e adicione os dois.
      if (casalId) {
        await set(ref(db, `pairCodes/${chave}`), { casalId });
      } else {
        await set(ref(db, `pairCodes/${chave}`), { geradoPor: authUser.uid, nomeCriador: perfil?.nome || 'Usuário' });
      }
      setCodigoGerado(chave);
    } catch(e) { Alert.alert('Erro', 'Falha ao gerar código.'); }
  }

  async function salvarGenero(genero) {
    try {
      await update(ref(db, `usuarios/${authUser.uid}`), { genero });
      setPerfil(p => ({ ...p, genero }));
      // alpha 0.0.19: se mudou para homem/nao_informado, remove horário do casal
      // para o countdown e notificações não ficarem presos no horário de quando era mulher
      if (genero !== 'mulher' && casalId) {
        await remove(ref(db, `casais/${casalId}/config/horariosNotificacao/${authUser.uid}`));
        setCasalConfig(c => {
          const h = { ...(c.horariosNotificacao || {}) };
          delete h[authUser.uid];
          return { ...c, horariosNotificacao: h };
        });
        // Também limpa o horarioPessoal do perfil local
        await update(ref(db, `usuarios/${authUser.uid}`), { horarioPessoal: null });
        setPerfil(p => ({ ...p, horarioPessoal: null }));
        if (casalId) await configurarAlarmes(casalId);
      }
      setModalGenero(false);
    } catch(e) { Alert.alert('Erro', 'Não foi possível salvar.'); }
  }

  // ── alpha 0.0.15: salvarHorarioPessoal ───────────────────────────────────────
  // Só mulher chega até aqui (botão bloqueado pra homem).
  // 1. Salva em /usuarios/{uid}/horarioPessoal
  // 2. Se pareada, copia para /casais/{cid}/config/horariosNotificacao/{uid}
  //    → parceiro(s) recebem notificação no mesmo horário automaticamente
  // ─────────────────────────────────────────────────────────────────────────────
  async function salvarHorarioPessoal(horarioOverride) {
    const horario = (horarioOverride || horarioInput).trim();
    if (!/^\d{2}:\d{2}$/.test(horario)) { Alert.alert('Formato inválido', 'Use HH:MM — ex: 21:00'); return; }
    try {
      // 1. Salva no perfil do usuário
      await update(ref(db, `usuarios/${authUser.uid}`), { horarioPessoal: horario });
      setPerfil(p => ({ ...p, horarioPessoal: horario }));
      // 2. Se pareada, atualiza o nó do casal para todos receberem
      if (casalId) {
        await update(ref(db, `casais/${casalId}/config/horariosNotificacao`), { [authUser.uid]: horario });
        setCasalConfig(c => ({
          ...c,
          horariosNotificacao: { ...(c.horariosNotificacao || {}), [authUser.uid]: horario }
        }));
        await configurarAlarmes(casalId);
      }
      setModalHorario(false);
      Alert.alert('✅ Salvo', `Lembrete: ${horario}\nSeu parceiro(a) também será notificado(a)!`);
    } catch(e) { Alert.alert('Erro', 'Falha ao salvar horário.'); }
  }

  function calcularRecompensa(streakAtual) {
    let pontosGanhos = 10, antrixGanho = 5;
    if (streakAtual >= 2) { pontosGanhos = 15; antrixGanho = 7; }
    if (streakAtual >= 3) { pontosGanhos = 20; antrixGanho = 10; }
    if (streakAtual >= 4) { pontosGanhos = 30; antrixGanho = 15; }
    if (streakAtual >= 5) { pontosGanhos = 50; antrixGanho = 25; }
    return { pontosGanhos, antrixGanho };
  }

  // Retorna o path base para historico/dataInicio/pausa
  // Se tem casal → usa /casais/{casalId}
  // Se solo      → usa /usuarios/{uid}/solo
  function getBasePath() {
    if (casalId) return `casais/${casalId}`;
    return `usuarios/${authUser.uid}/solo`;
  }

  function calcularStreakAtual() {
    if (!dataInicio) return 0;
    let streakAtual = 0, data = hoje;
    while (true) {
      if (historico[data]?.tomou) { streakAtual++; data = addDias(data, -1); }
      else break;
    }
    return streakAtual;
  }

  async function verificarTodasConquistas(novoAntrix, novoStreak) {
    const dados = {
      streak: novoStreak || streak,
      antrixTotal: (estatisticas.antrixTotal || 0) + (novoAntrix || 0),
      tomadasHorarioPerfeito: estatisticas.tomadasHorarioPerfeito,
    };
    for (const categoria of Object.values(CONQUISTAS)) {
      for (const conquista of categoria) {
        const id = conquista.id;
        if (!conquistasDesbloqueadas[id] && conquista.cond(dados)) {
          setConquistasDesbloqueadas(prev => ({ ...prev, [id]: { desbloqueada: true, data: new Date().toISOString() } }));
          await update(ref(db, `usuarios/${authUser.uid}/conquistas/${id}`), { desbloqueada: true, data: new Date().toISOString() });
          if (conquista.titulo) {
            setTitulosDesbloqueados(prev => ({ ...prev, [id]: { titulo: conquista.titulo, cor: conquista.corTitulo } }));
            await update(ref(db, `usuarios/${authUser.uid}/titulosDesbloqueados/${id}`), { titulo: conquista.titulo, cor: conquista.corTitulo });
          }
          Alert.alert('🏆 Conquista!', conquista.nome);
        }
      }
    }
  }

  async function verificarAmor64(texto) {
    const frase = texto.trim().toLowerCase();
    const alvo  = 'eu te amo 64 meu neném';
    if (frase !== alvo) return;
    if (conquistasDesbloqueadas['amor_64']) {
      Alert.alert('💖', 'Você já desbloqueou este título!');
      return;
    }
    const novaConq = { desbloqueada: true, data: new Date().toISOString() };
    setConquistasDesbloqueadas(prev => ({ ...prev, amor_64: novaConq }));
    await update(ref(db, `usuarios/${authUser.uid}/conquistas/amor_64`), novaConq);
    const novoTitulo = { titulo: 'Aquele Que Ama Mais', cor: '#000000' };
    setTitulosDesbloqueados(prev => ({ ...prev, amor_64: novoTitulo }));
    await update(ref(db, `usuarios/${authUser.uid}/titulosDesbloqueados/amor_64`), novoTitulo);
    // Equipa automaticamente
    setTituloEquipado('amor_64');
    await update(ref(db, `usuarios/${authUser.uid}`), { tituloEquipado: 'amor_64', antrix: antrix + 64 });
    setAntrix(a => a + 64);
    // Animação de revelação
    Animated.sequence([
      Animated.timing(tituloAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(tituloAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    Alert.alert('🖤 Título Secreto Desbloqueado!', '"Aquele Que Ama Mais"\n\n+64 Antrix de bônus 💠');
  }

  async function comprarItem(itemId, preco, tipo, gratuito = false) {
    if (!gratuito && antrix < preco) {
      Alert.alert('Antrix insuficiente', `Você tem ${antrix} Antrix. Preço: ${preco}`);
      return false;
    }
    if (itensComprados[tipo].includes(itemId)) { Alert.alert('Você já possui este item'); return false; }
    if (!gratuito) {
      const novoAntrix = antrix - preco;
      setAntrix(novoAntrix);
      await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
    }
    const novosItens = [...itensComprados[tipo], itemId];
    setItensComprados(prev => ({ ...prev, [tipo]: novosItens }));
    await set(ref(db, `usuarios/${authUser.uid}/itensComprados/${tipo}`), novosItens);
    Alert.alert(gratuito ? 'Recompensa!' : 'Comprado!', 'Item adquirido com sucesso.');
    return true;
  }

  function isTemaRaro(itemId) { return ITENS_LOJA.temas.raro.some(t => t.id === itemId); }
  function isTemaLendario(itemId) { return ITENS_LOJA.temas.lendario.some(t => t.id === itemId); }

  // ── ADMIN: Apaga APENAS antrix, conquistas e itens da loja ──
  // NÃO apaga conta, nome, email, isAdmin, casalId, genero
  async function adminResetarLoja() {
    Alert.alert(
      '⚠️ Reset Loja/Conquistas',
      'Isso vai zerar Antrix, itens comprados e conquistas. Sua conta, parceiro e histórico de pílulas NÃO serão afetados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetar', style: 'destructive', onPress: async () => {
          const dadosReset = {
            antrix: 0, indPontos: 0, streak: 0,
            itensComprados: { temas: [], selos: [], molduras: [] },
            seloEquipado: null, molduraEquipada: null,
            titulosDesbloqueados: {}, tituloEquipado: null,
            conquistas: {},
            estatisticas: {
              rankPrimeiro: 0, rankPrimeiroConsecutivo: 0, antrixTotal: 0,
              totalTemasComprados: 0, totalTemasRarosComprados: 0, totalTemasLendariosComprados: 0,
              totalSelosComprados: 0, totalMoldurasCompradas: 0,
              tomadasHorarioPerfeito: 0, temasDiferentesUsados: [],
              loginStreak: 0, diasSemErroHorario: 0, antrixSemGastar: 0,
            }
          };
          await update(ref(db, `usuarios/${authUser.uid}`), dadosReset);
          setAntrix(0); setIndPontos(0); setStreak(0);
          setItensComprados({ temas: [], selos: [], molduras: [] });
          setSeloEquipado(null); setMolduraEquipada(null);
          setTitulosDesbloqueados({}); setTituloEquipado(null);
          setConquistasDesbloqueadas({});
          setModalAdmin(false);
          Alert.alert('✅ Reset completo', 'Antrix, itens e conquistas foram resetados. Sua conta e histórico estão intactos.');
        }}
      ]
    );
  }

  async function adminSetAntrixInfinito() {
    const novoAntrix = 999999;
    setAntrix(novoAntrix);
    await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
    Alert.alert('Admin', 'Antrix: 999999');
  }

  async function adminDesbloquearTodosItens() {
    const todosTemas = [
      ...ITENS_LOJA.temas.comum, ...ITENS_LOJA.temas.raro,
      ...ITENS_LOJA.temas.bonito, ...ITENS_LOJA.temas.lendario
    ].map(t => t.id);
    const todosSelos = [
      ...ITENS_LOJA.selos.comum, ...ITENS_LOJA.selos.raro, ...ITENS_LOJA.selos.lendario
    ].map(s => s.id);
    const todasMolduras = [
      ...ITENS_LOJA.molduras.comum, ...ITENS_LOJA.molduras.raro, ...ITENS_LOJA.molduras.lendario
    ].map(m => m.id);
    setItensComprados({ temas: todosTemas, selos: todosSelos, molduras: todasMolduras });
    await set(ref(db, `usuarios/${authUser.uid}/itensComprados`), { temas: todosTemas, selos: todosSelos, molduras: todasMolduras });
    Alert.alert('Admin', 'Todos os itens desbloqueados!');
  }

  async function adminLimparDiaHoje() {
    try {
      const base = getBasePath();
      if (historico[hoje]) {
        await remove(ref(db, `${base}/historico/${hoje}`));
        if (!casalId) setHistorico(prev => { const n = {...prev}; delete n[hoje]; return n; });
        Alert.alert('Admin', 'Registro de hoje removido.');
      } else {
        Alert.alert('Admin', 'Nenhum registro hoje.');
      }
    } catch(e) { Alert.alert('Erro', 'Falha ao remover.'); }
  }

  async function marcarTomou() {
    if (pausa?.ativa) { Alert.alert('⏸️ Pausa ativa', 'Aguarde o fim da pausa.'); return; }
    if (historico[hoje]?.tomou) { Alert.alert('Já tomou hoje', 'Você já registrou a pílula de hoje.'); return; }
    try {
      const agora = new Date();
      const hora = agora.toTimeString().slice(0, 5);
      const base = getBasePath();
      // Horário pessoal (solo) ou do casal (pareada)
      const horariosDoCalsal = casalConfig?.horariosNotificacao || {};
      const horarioDupla = Object.values(horariosDoCalsal)[0] || null;
      const meuHorarioPessoal = perfil?.horarioPessoal || horarioDupla || null;
      const naJanela = meuHorarioPessoal
        ? estaDentroJanela(meuHorarioPessoal, JANELA_TOLERANCIA_MIN, agora)
        : false;
      const noHorarioCerto = naJanela;
      // Salva no historico (casal ou solo)
      await set(ref(db, `${base}/historico/${hoje}`), {
        data: hoje, hora, tomou: true, quemMarcou: authUser.uid,
        noHorarioCerto, naJanelaOuro: naJanela,
      });
      // Pontos do casal só se pareada
      if (casalId) {
        const np = { ...pontos };
        const uidMulher = Object.entries(casalConfig?.horariosNotificacao || {}).map(([k]) => k)[0] || authUser.uid;
        const uidGanha = naJanela ? uidMulher : authUser.uid;
        np[uidGanha] = (np[uidGanha] || 0) + 1;
        await set(ref(db, `casais/${casalId}/pontos`), np);
      }
      const streakAtual = calcularStreakAtual();
      const { pontosGanhos, antrixGanho } = calcularRecompensa(streakAtual);
      const novoStreak = streakAtual + 1;
      const novoIndPontos = indPontos + pontosGanhos;
      const novoAntrix = antrix + antrixGanho;
      await update(ref(db, `usuarios/${authUser.uid}`), { indPontos: novoIndPontos, antrix: novoAntrix, streak: novoStreak });
      setIndPontos(novoIndPontos); setAntrix(novoAntrix); setStreak(novoStreak);
      // Atualiza historico local imediatamente (modo solo)
      if (!casalId) {
        setHistorico(prev => ({ ...prev, [hoje]: { data: hoje, hora, tomou: true, quemMarcou: authUser.uid, noHorarioCerto, naJanelaOuro: naJanela } }));
      }
      setEstatisticas(prev => ({
        ...prev,
        antrixTotal: prev.antrixTotal + antrixGanho,
        tomadasHorarioPerfeito: prev.tomadasHorarioPerfeito + (naJanela ? 1 : 0),
      }));
      await verificarTodasConquistas(antrixGanho, novoStreak);
      const total = Object.keys(historico).length + 1;
      if (total % 28 === 0) { setConfete(true); setTimeout(() => setConfete(false), 3000); }
      setModalAmor(true);
      Animated.sequence([
        Animated.timing(fadeAmor, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(fadeAmor, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => setModalAmor(false));
      if (casalId) await notificarParceiro(hora);
      // XP ao pet por marcar pílula
      if (pet) await darXpAoPet(naJanela ? 50 : 10, 'pilula');
      Alert.alert('✅ Feito!', `+${pontosGanhos} pts, +${antrixGanho} Antrix! Streak: ${novoStreak}`);
    } catch(e) { Alert.alert('Erro', 'Falha ao registrar: ' + e.message); }
  }

  async function adminToggleDia(key) {
    // alpha 0.0.27: mulher pode marcar/desmarcar dias no próprio calendário sem ser admin
    // Admin tem o toggle completo (com estorno de recompensas)
    if (!isAdmin && !ehMulher) return; // homem sem admin não faz nada

    try {
      if (historico[key]) {
        // Desmarcar
        if (isAdmin) {
          const entrada = historico[key];
          // Só estorna se foi marcado como tomado (não faltas automáticas)
          if (entrada.tomou && !entrada.faltaAutomatica) {
            const uidMarcou = entrada.quemMarcou;
            if (uidMarcou) {
              const { pontosGanhos, antrixGanho } = calcularRecompensa(1);
              const snapUser = await get(ref(db, `usuarios/${uidMarcou}`));
              if (snapUser.exists()) {
                const dadosUser = snapUser.val();
                const novoIndPontos = Math.max(0, (dadosUser.indPontos || 0) - pontosGanhos);
                const novoAntrix    = Math.max(0, (dadosUser.antrix    || 0) - antrixGanho);
                const novoStreak    = Math.max(0, (dadosUser.streak    || 0) - 1);
                await update(ref(db, `usuarios/${uidMarcou}`), { indPontos: novoIndPontos, antrix: novoAntrix, streak: novoStreak });
                if (uidMarcou === authUser?.uid) { setIndPontos(novoIndPontos); setAntrix(novoAntrix); setStreak(novoStreak); }
              }
              const npAtual = { ...pontos };
              const uidMulher = Object.keys(casalConfig?.horariosNotificacao || {})[0];
              const uidPonto = entrada.naJanelaOuro ? (uidMulher || uidMarcou) : uidMarcou;
              if (npAtual[uidPonto] > 0) {
                npAtual[uidPonto] = (npAtual[uidPonto] || 1) - 1;
                await set(ref(db, `casais/${casalId}/pontos`), npAtual);
              }
            }
          }
          await remove(ref(db, `${base}/historico/${key}`));
        if (!casalId) setHistorico(prev => { const n = {...prev}; delete n[key]; return n; });
          Alert.alert('Admin', `Dia ${key} desmarcado e recompensas revertidas.`);
        } else {
          // Mulher comum: só desmarca visualmente, sem estorno
          await remove(ref(db, `casais/${casalId}/historico/${key}`));
        }
      } else {
        // Marcar o dia
        if (isAdmin) {
          await set(ref(db, `casais/${casalId}/historico/${key}`), {
            data: key, hora: '--:--', tomou: true, quemMarcou: null,
            noHorarioCerto: false, naJanelaOuro: false, adminManual: true,
          });
        } else {
          // Mulher comum: marca como tomado sem recompensa extra (só visual)
          await set(ref(db, `casais/${casalId}/historico/${key}`), {
            data: key, hora: '--:--', tomou: true, quemMarcou: authUser.uid,
            noHorarioCerto: false, naJanelaOuro: false, manualMulher: true,
          });
        }
      }
    } catch(e) { Alert.alert('Erro', 'Falha ao alterar dia.'); }
  }

  async function definirDataInicio() {
    try {
      const ano = new Date().getFullYear();
      const dataStr = `${ano}-${String(pickerMes + 1).padStart(2, '0')}-${String(pickerDia).padStart(2, '0')}`;
      const base = getBasePath();
      await set(ref(db, `${base}/dataInicio`), dataStr);
      setDataInicio(dataStr);
      setModalInicio(false);
      Alert.alert('✅ Data definida', `Cartela iniciada em ${dataStr}`);
    } catch(e) { Alert.alert('Erro', 'Falha ao salvar data.'); }
  }

  function gerarRelatorioMensal() {
    // Monta relatório completo do ciclo atual
    const entradasHist = Object.entries(historico);
    const totalTomados = entradasHist.filter(([,v]) => v?.tomou).length;
    const diasCertos = entradasHist.filter(([,v]) => v?.tomou && v?.noHorarioCerto !== false).length;
    const diasErrados = totalTomados - diasCertos;
    const diasOrdenados = entradasHist.filter(([,v]) => v?.tomou).map(([k,v]) => ({ data: k, hora: v.hora, certo: v?.noHorarioCerto !== false })).sort((a,b) => a.data.localeCompare(b.data));
    const primeiroDia = diasOrdenados[0]?.data || dataInicio || '-';
    const ultimoDia = diasOrdenados[diasOrdenados.length-1]?.data || '-';
    const pausaInicio = pausa?.inicio || hoje;
    const pausaFim = pausa?.fim || addDias(hoje, 4);
    const retomadaEstimada = addDias(pausaFim, 1);
    // Antrix e pontos ganhos no ciclo
    const antrixGanhoTotal = diasOrdenados.reduce((acc, d) => {
      const streakDia = 1; // simplificado
      return acc + (d.certo ? 10 : 5);
    }, 0);
    return {
      geradoEm: new Date().toISOString(),
      cicloInicio: primeiroDia,
      cicloFim: ultimoDia,
      totalDiasTomados: totalTomados,
      diasNoHorarioCerto: diasCertos,
      diasForaDoHorario: diasErrados,
      diasPerdidos: Math.max(0, Object.keys(historico).length > 0 ?
        Math.floor((new Date(ultimoDia+'T12:00:00') - new Date(primeiroDia+'T12:00:00')) / 86400000) + 1 - totalTomados : 0),
      diasTomados: diasOrdenados,
      pausaInicio,
      pausaFim,
      retomadaEstimada,
      antrixEstimado: antrixGanhoTotal,
      pontos: indPontos,
      streak,
    };
  }

  async function abrirRelatorioMensal() {
    // Carrega histórico de relatórios do Firebase
    try {
      const snap = await get(ref(db, `casais/${casalId}/relatoriosMensais`));
      const lista = [];
      if (snap.exists()) {
        snap.forEach(child => lista.push({ id: child.key, ...child.val() }));
        lista.sort((a,b) => b.geradoEm?.localeCompare(a.geradoEm));
      }
      setHistoricoRelatorios(lista);
      // Mostra o relatório atual do ciclo em andamento
      setRelatorioAtual(gerarRelatorioMensal());
      setModalRelatorio(true);
    } catch(e) { Alert.alert('Erro', 'Não foi possível carregar relatórios.'); }
  }

  async function analisarEIniciarPausa() {
    const rel = gerarRelatorioMensal();
    const msg = `⏸️ Iniciar pausa?

📊 Ciclo atual:
• ${rel.totalDiasTomados} dias tomados
• ${rel.diasNoHorarioCerto} no horário certo
• ${rel.diasForaDoHorario} fora do horário
• ${rel.diasPerdidos} dias perdidos
• Consistência: ${rel.totalDiasTomados > 0 ? Math.round(rel.diasNoHorarioCerto / Math.max(rel.totalDiasTomados + rel.diasPerdidos, 1) * 100) : 0}%

Pausa: ${rel.pausaInicio} → ${rel.pausaFim}
Retomada: ${rel.retomadaEstimada}

O relatório será salvo no app.`;
    Alert.alert('⏸️ Iniciar Pausa?', msg, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Iniciar Pausa', onPress: async () => {
        await iniciarPausa();
        try {
          // Salva relatório completo no Firebase com timestamp único
          const relKey = `rel_${Date.now()}`;
          await set(ref(db, `casais/${casalId}/relatoriosMensais/${relKey}`), rel);
        } catch(e) {}
        Alert.alert('✅ Pausa iniciada!', `Duração: 4 dias.\nRetomada estimada: ${rel.retomadaEstimada}\nRelatório salvo no app!`);
      }}
    ]);
  }

  async function iniciarPausa() {
    const base = getBasePath();
    try { await set(ref(db, `${base}/pausa`), { inicio: hoje, fim: addDias(hoje, 3), ativa: true }); }
    catch(e) {}
  }

  async function despausar() {
    const base = getBasePath();
    try { await set(ref(db, `${base}/pausa/ativa`), false); } catch(e) {}
  }

  async function enviarSugestao() {
    if (!sugestao.trim()) return;
    try {
      await push(ref(db, `casais/${casalId}/sugestoes`), { texto: sugestao.trim(), data: new Date().toISOString(), usuario: perfil?.nome });
      setSugestao(''); Alert.alert('Sucesso', 'Sugestão enviada!');
    } catch(e) {}
  }

  async function enviarMensagem() {
    if (!novaMensagem.trim()) return;
    // Se não tem casal, salva em mural pessoal do usuário
    const muralPath = casalId
      ? `casais/${casalId}/mural`
      : `usuarios/${authUser.uid}/mural`;
    try {
      const msgRef = push(ref(db, muralPath));
      await set(msgRef, {
        texto: novaMensagem.trim(),
        usuario: perfil?.nome,
        uid: authUser.uid,
        timestamp: Date.now()
      });
      setNovaMensagem('');
    } catch(e) { Alert.alert('Erro', 'Falha ao enviar mensagem.'); }
  }

  async function deletarMensagem(msgId) {
    try {
      await remove(ref(db, `casais/${casalId}/mural/${msgId}`));
    } catch(e) { Alert.alert('Erro', 'Falha ao deletar.'); }
  }

  async function adminLimparTodoMural() {
    Alert.alert('🗑️ Limpar Mural', 'Apagar TODAS as mensagens?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar tudo', style: 'destructive', onPress: async () => {
        try { await remove(ref(db, `casais/${casalId}/mural`)); }
        catch(e) { Alert.alert('Erro', 'Falha ao limpar mural.'); }
      }}
    ]);
  }

  async function carregarRankingGlobal() {
    setLoadingRanking(true);
    try {
      const snapshot = await get(ref(db, 'usuarios'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        // alpha 0.0.27: filtra contas ativas — precisa ter casalId OU streak > 0
        // Remove contas fantasma/teste que nunca usaram o app de verdade
        let lista = Object.values(data)
          .filter(u => (u.indPontos || 0) > 0 && (u.casalId || (u.streak || 0) > 0))
          .map(u => ({ nome: u.nome || '???', pontos: u.indPontos || 0 }));
        lista.sort((a, b) => b.pontos - a.pontos);
        setGlobalRanking(lista);
      } else { setGlobalRanking([]); }
    } catch(e) { Alert.alert('Erro', 'Não foi possível carregar o ranking.'); }
    setLoadingRanking(false); setModalRanking(true);
  }

  async function equiparSelo(seloId) {
    setSeloEquipado(seloId);
    await update(ref(db, `usuarios/${authUser.uid}`), { seloEquipado: seloId });
    setModalSelo(false);
  }

  async function equiparMoldura(molduraId) {
    setMolduraEquipada(molduraId);
    await update(ref(db, `usuarios/${authUser.uid}`), { molduraEquipada: molduraId });
    setModalMoldura(false);
  }

  async function equiparTitulo(tituloId) {
    setTituloEquipado(tituloId);
    await update(ref(db, `usuarios/${authUser.uid}`), { tituloEquipado: tituloId });
    setModalTitulo(false);
  }

  async function escolherFotoGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão negada'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      try {
        // alpha 0.0.27: faz upload para Firebase Storage e salva URL permanente
        // URI local some quando o app fecha — URL do Storage persiste sempre
        const storage = getStorage(firebaseApp);
        const resp = await fetch(uri);
        const blob = await resp.blob();
        const storageRef = sRef(storage, `fotos/${authUser.uid}/perfil.jpg`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        // Salva URL permanente no perfil do usuário
        await update(ref(db, `usuarios/${authUser.uid}`), { fotoPerfil: downloadURL });
        // Salva também no casal se pareado
        if (casalId) {
          await set(ref(db, `casais/${casalId}/fotos/${authUser.uid}`), downloadURL);
        }
        setFotos(prev => ({ ...prev, [authUser.uid]: downloadURL }));
        Alert.alert('✅ Foto atualizada!');
      } catch(e) {
        // Fallback: salva URI local se upload falhar (comportamento anterior)
        await update(ref(db, `usuarios/${authUser.uid}`), { fotoPerfil: uri });
        if (casalId) await set(ref(db, `casais/${casalId}/fotos/${authUser.uid}`), uri);
        setFotos(prev => ({ ...prev, [authUser.uid]: uri }));
        Alert.alert('⚠️ Foto salva localmente', 'Upload falhou. A foto pode sumir ao fechar o app.');
      }
    }
  }

  async function baixarOta() {
    if (!otaInfo?.apkUrl) return;
    setOtaProgress(0.01);
    const destino = FileSystem.documentDirectory + 'update.apk';
    try {
      const dl = FileSystem.createDownloadResumable(otaInfo.apkUrl, destino, {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          setOtaProgress(totalBytesWritten / totalBytesExpectedToWrite);
        });
      const { uri } = await dl.downloadAsync();
      setOtaProgress(1);
      Alert.alert('Download concluído! 🎉', 'Toque em OK para instalar.', [{
        text: 'OK', onPress: async () => {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: uri, flags: 1, type: 'application/vnd.android.package-archive',
          });
          setModalOta(false); setOtaProgress(0);
        },
      }]);
    } catch(e) { Alert.alert('Erro', 'Não foi possível baixar.'); setOtaProgress(0); }
  }

  function ignorarOta() { versaoIgnoradaRef.current = otaInfo?.versao; setModalOta(false); }

  const tomouHoje  = !!historico[hoje];
  const totalDias  = Object.keys(historico).length;
  const diaCartela = totalDias % 28 || (totalDias > 0 ? 28 : 0);
  const pD         = pausa?.ativa ? Math.ceil((new Date(pausa.fim + 'T23:59:59') - new Date()) / 86400000) : null;
  const fotoAtual  = fotos[authUser?.uid];
  const nomeAtual  = perfil?.nome || 'Usuário';
  const ehMulher   = perfil?.genero === 'mulher';
  // Horário que o usuário vê: mulher vê o próprio, homem vê o da parceira (se houver)
  const horariosDoCalsal = casalConfig?.horariosNotificacao || {};
  const meuHorario = ehMulher
    ? (perfil?.horarioPessoal || null)
    : (Object.values(horariosDoCalsal)[0] || null); // homem: pega o primeiro horário do casal
  const baixando   = otaProgress > 0 && otaProgress < 1;
  const temUpdate  = otaInfo && versaoMaior(otaInfo.versao, VERSAO_ATUAL);

  // ── RENDERS DE TELA ─────────────────────────────────────────────────────────
  if (tela === 'splash') return (
    <View style={s.splash}>
      <Text style={s.splashEmoji}>💊</Text>
      <Text style={s.splashTitle}>DuoTrack 💊</Text>
      <Text style={{ color: '#555', marginTop: 4 }}>v{VERSAO_ATUAL}</Text>
      <ActivityIndicator color="#ff2d78" style={{ marginTop: 20 }} />
    </View>
  );

  if (tela === 'auth') return (
    <ScrollView contentContainerStyle={s.authWrap} keyboardShouldPersistTaps="handled">
      <Text style={s.splashEmoji}>💊</Text>
      <Text style={s.splashTitle}>DuoTrack 💊</Text>
      <Text style={s.authSub}>{authMode === 'login' ? 'Entrar na conta' : 'Criar conta'}</Text>
      {authMode === 'cadastro' && <TextInput style={s.input} placeholder="Seu nome" placeholderTextColor="#555" value={authNome} onChangeText={setAuthNome} />}
      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#555" value={authEmail} onChangeText={setAuthEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Senha" placeholderTextColor="#555" value={authSenha} onChangeText={setAuthSenha} secureTextEntry />
      {!!authErro && <Text style={s.erroTxt}>{authErro}</Text>}
      <TouchableOpacity style={s.btnPrimary} onPress={authMode === 'login' ? fazerLogin : fazerCadastro} disabled={authLoading}>
        {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPrimaryTxt}>{authMode === 'login' ? 'Entrar' : 'Criar conta'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setAuthMode(m => m === 'login' ? 'cadastro' : 'login')}>
        <Text style={s.authSwitch}>{authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (tela === 'pair') return (
    <ScrollView contentContainerStyle={s.authWrap}>
      <Text style={{ fontSize: 52, marginBottom: 16 }}>💕</Text>
      <Text style={s.splashTitle}>Conectar dupla 🤝</Text>
      <Text style={s.authSub}>Olá, {nomeAtual}!</Text>
      {pairStep === 'menu' && <>
        <TouchableOpacity style={s.btnPrimary} onPress={criarCasal} disabled={pairLoading}><Text style={s.btnPrimaryTxt}>✨ Criar nova dupla</Text></TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => setPairStep('entrar')}><Text style={s.btnSecondaryTxt}>🔑 Entrar com chave</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btnSecondary, { marginTop: 8 }]} onPress={fazerLogout}><Text style={s.btnSecondaryTxt}>🚪 Trocar de conta</Text></TouchableOpacity>
      </>}
      {pairStep === 'mostrarChave' && <>
        <View style={s.chaveBox}><Text style={s.chaveLabel}>Sua chave</Text><Text style={s.chaveValor}>{pairChave}</Text></View>
        <TouchableOpacity style={s.btnPrimary} onPress={() => setTela('app')}><Text style={s.btnPrimaryTxt}>Continuar →</Text></TouchableOpacity>
      </>}
      {pairStep === 'entrar' && <>
        <TextInput style={[s.input, s.inputChave]} placeholder="Chave" placeholderTextColor="#555" value={pairInput} onChangeText={t => setPairInput(t.toUpperCase())} maxLength={6} />
        <TouchableOpacity style={s.btnPrimary} onPress={entrarCasal} disabled={pairLoading}><Text style={s.btnPrimaryTxt}>🔑 Entrar na dupla</Text></TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => setPairStep('menu')}><Text style={s.btnSecondaryTxt}>← Voltar</Text></TouchableOpacity>
      </>}
    </ScrollView>
  );

  // ── TELA PRINCIPAL ──────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Modal OTA */}
      <Modal transparent visible={modalOta} animationType="slide" onRequestClose={() => { if (!otaInfo?.forcarAtualizar) ignorarOta(); }}>
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🚀 Nova versão disponível!</Text>
          <Text style={{ color: tema.sub, fontSize: 12, marginBottom: 4 }}>Versão atual: {VERSAO_ATUAL} → {otaInfo?.versao}</Text>
          <Text style={[s.authSub, { textAlign: 'left', marginBottom: 20 }]}>{otaInfo?.changelog || 'Novidades!'}</Text>
          {baixando && <View style={s.progressWrap}><View style={[s.progressBar, { width: `${Math.round(otaProgress * 100)}%` }]} /></View>}
          <TouchableOpacity style={[s.btnPrimary, baixando && { opacity: 0.6 }]} onPress={baixarOta} disabled={baixando}>
            <Text style={s.btnPrimaryTxt}>{baixando ? `Baixando... ${Math.round(otaProgress * 100)}%` : '⬇️ Baixar agora'}</Text>
          </TouchableOpacity>
          {!otaInfo?.forcarAtualizar && <TouchableOpacity style={s.btnSecondary} onPress={ignorarOta}><Text style={s.btnSecondaryTxt}>Lembrar depois</Text></TouchableOpacity>}
        </View></View>
      </Modal>

      {/* Modal Item Explorado pelo Pet */}
      <Modal transparent visible={modalItemExplorado} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={{ fontSize: 48, textAlign: 'center' }}>🎒</Text>
          <Text style={s.modalTitulo}>Seu pet voltou!</Text>
          {itemExploradoPendente && (<>
            <Text style={{ color: tema.sub, textAlign: 'center', marginBottom: 8 }}>
              Ele encontrou algo especial durante a exploração...
            </Text>
            <View style={{ backgroundColor: tema.bg, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: tema.primary }}>
              <Text style={{ fontSize: 32, marginBottom: 4 }}>✨</Text>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{itemExploradoPendente.nome}</Text>
              <Text style={{ color: tema.primary, fontSize: 12, marginTop: 4 }}>Raridade: {itemExploradoPendente.raridade}</Text>
              <Text style={{ color: '#00ff87', fontSize: 13, marginTop: 8 }}>+{itemExploradoPendente.xpBonus} XP · +{itemExploradoPendente.antrixBonus} Antrix</Text>
            </View>
          </>)}
          <TouchableOpacity style={s.btnPrimary} onPress={coletarItemExploracao}>
            <Text style={s.btnPrimaryTxt}>🎉 Coletar!</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal de Caixas de Pet */}
      <Modal transparent visible={modalCaixas} animationType="slide">
        <View style={s.modalWrap}>
          <ScrollView>
            <View style={s.modalCard}>
              <Text style={s.modalTitulo}>📦 Caixas de Pet</Text>
              <Text style={{ color: tema.sub, fontSize: 12, marginBottom: 16, textAlign: 'center' }}>
                Abra uma caixa para ganhar um pet! Seus Antrix: {antrix} 💠
              </Text>
              {pet && (
                <View style={{ backgroundColor: '#ff444422', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#ff4444' }}>
                  <Text style={{ color: '#ff4444', fontSize: 12, textAlign: 'center' }}>
                    ⚠️ Você já tem um pet! Transfira-o antes de abrir uma nova caixa.
                  </Text>
                </View>
              )}
              {PET_CAIXAS.map(caixa => (
                <TouchableOpacity
                  key={caixa.id}
                  style={[s.rankCard, { borderLeftWidth: 4, borderLeftColor: caixa.cor, marginBottom: 10 }]}
                  onPress={() => abrirCaixa(caixa)}
                  disabled={!!pet}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{caixa.emoji} {caixa.nome}</Text>
                    <Text style={{ color: caixa.cor, fontSize: 11, marginTop: 2 }}>Raridade: {caixa.raridade}</Text>
                  </View>
                  <Text style={{ color: tema.primary, fontWeight: '900', fontSize: 16 }}>{caixa.preco} 💠</Text>
                </TouchableOpacity>
              ))}
              <View style={{ backgroundColor: '#1a001022', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#4b0082' }}>
                <Text style={{ color: '#aa88ff', fontSize: 11, textAlign: 'center' }}>
                  🔮 Existe uma Caixa Secreta que não pode ser comprada...{'\n'}Descubra como consegui-la.
                </Text>
              </View>
              <TouchableOpacity style={[s.btnSecondary, { marginTop: 12 }]} onPress={() => setModalCaixas(false)}>
                <Text style={s.btnSecondaryTxt}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Pet */}
      <Modal transparent visible={modalPet} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          {pet ? (<>
            <Text style={s.modalTitulo}>🐾 Seu Pet</Text>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 64 }}>{(PET_FASES[pet.fase] || PET_FASES[1]).emoji}</Text>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, marginTop: 8 }}>
                {pet.nome || (PET_FASES[pet.fase] || PET_FASES[1]).nome}
              </Text>
              <Text style={{ color: tema.primary, fontSize: 12 }}>
                {PET_TIPOS[pet.tipo]?.nome} · Fase {pet.fase}/10
              </Text>
              <Text style={{ color: pet.humor === 'feliz' ? '#00ff87' : pet.humor === 'triste' ? '#ff4444' : tema.sub, fontSize: 12, marginTop: 4 }}>
                {pet.humor === 'feliz' ? '😊 Feliz' : pet.humor === 'triste' ? '😢 Triste' : pet.humor === 'dormindo' ? '💤 Dormindo' : '😐 Neutro'}
              </Text>
            </View>
            {/* Barra de XP */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: tema.sub, fontSize: 11, marginBottom: 4 }}>
                XP: {pet.xp} / {PET_FASES[Math.min(pet.fase + 1, 10)]?.xpNecessario || '∞'}
              </Text>
              <View style={s.progressWrap}>
                <View style={[s.progressBar, { width: `${Math.min(100, ((pet.xp - (PET_FASES[pet.fase]?.xpNecessario || 0)) / Math.max(1, ((PET_FASES[Math.min(pet.fase+1,10)]?.xpNecessario || pet.xp+1) - (PET_FASES[pet.fase]?.xpNecessario||0)))) * 100)}%` }]} />
              </View>
            </View>
            {/* Energia */}
            <Text style={{ color: tema.sub, fontSize: 11, marginBottom: 4 }}>
              Energia: {calcularEnergiaAtual(pet)}/100
            </Text>
            <View style={s.progressWrap}>
              <View style={[s.progressBar, { width: `${calcularEnergiaAtual(pet)}%`, backgroundColor: calcularEnergiaAtual(pet) > 50 ? '#00ff87' : '#ffd60a' }]} />
            </View>
            <TouchableOpacity style={[s.btnPrimary, { marginTop: 16 }]} onPress={alimentarPet}>
              <Text style={s.btnPrimaryTxt}>🍖 Alimentar (20 Antrix)</Text>
            </TouchableOpacity>
            {casalId && parceiro && (
              <TouchableOpacity style={[s.btnSecondary, { marginTop: 8 }]} onPress={() => { setModalPet(false); setModalTransferirPet(true); }}>
                <Text style={s.btnSecondaryTxt}>💝 Dar pet para {parceiro.nome}</Text>
              </TouchableOpacity>
            )}
          </>) : (<>
            <Text style={s.modalTitulo}>🐾 Sem Pet</Text>
            <Text style={{ color: tema.sub, textAlign: 'center', marginBottom: 16 }}>
              Abra uma caixa para ganhar seu primeiro pet!
            </Text>
            <TouchableOpacity style={s.btnPrimary} onPress={() => { setModalPet(false); setModalCaixas(true); }}>
              <Text style={s.btnPrimaryTxt}>📦 Ver Caixas</Text>
            </TouchableOpacity>
          </>)}
          <TouchableOpacity style={[s.btnSecondary, { marginTop: 8 }]} onPress={() => setModalPet(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Transferir Pet */}
      <Modal transparent visible={modalTransferirPet} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>💝 Transferir Pet</Text>
          <Text style={{ color: tema.sub, textAlign: 'center', marginBottom: 20 }}>
            Dar seu pet para {parceiro?.nome}? Ele sairá do seu perfil permanentemente.
          </Text>
          <TouchableOpacity style={[s.btnPrimary, { backgroundColor: '#ff2d78' }]} onPress={transferirPet}>
            <Text style={s.btnPrimaryTxt}>💝 Confirmar transferência</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnSecondary, { marginTop: 8 }]} onPress={() => setModalTransferirPet(false)}>
            <Text style={s.btnSecondaryTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Amor */}
      <Modal transparent visible={modalAmor} animationType="none">
        <Animated.View style={[s.modalAmor, { opacity: fadeAmor }]}>
          <Text style={{ fontSize: 80 }}>💕</Text>
          <Text style={s.modalAmorTxt}>Eu te amo amor</Text>
        </Animated.View>
      </Modal>

      {/* Modal Conectar (dentro de Perfil/Config) */}
      <Modal transparent visible={modalConectar} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🔗 Conectar parceiro(a)</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={gerarCodigoConvite}>
            <Text style={s.btnPrimaryTxt}>✨ Gerar código de convite</Text>
          </TouchableOpacity>
          {codigoGerado !== '' && (
            <View style={s.chaveBox}>
              <Text style={s.chaveLabel}>Compartilhe este código:</Text>
              <Text style={s.chaveValor}>{codigoGerado}</Text>
            </View>
          )}
          <Text style={[s.authSub, { marginVertical: 8 }]}>— ou inserir código recebido —</Text>
          <TextInput style={[s.input, s.inputChave]} placeholder="Código 6 dígitos" placeholderTextColor="#555"
            value={pairInput} onChangeText={t => setPairInput(t.toUpperCase())} maxLength={6} />
          <TouchableOpacity style={s.btnPrimary} onPress={entrarCasal} disabled={pairLoading}>
            <Text style={s.btnPrimaryTxt}>🔑 Entrar com código</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => { setModalConectar(false); setCodigoGerado(''); setPairInput(''); }}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Tema */}

      {/* ── Modal Relatório Mensal ── */}
      <Modal transparent visible={modalRelatorio} animationType="slide" onRequestClose={() => setModalRelatorio(false)}>
        <View style={s.modalWrap}>
          <View style={[s.modalCard, { maxHeight: '90%' }]}>
            <Text style={s.modalTitulo}>📊 Relatório Mensal</Text>
            <ScrollView style={{ maxHeight: 500 }}>
              {/* Ciclo atual */}
              {relatorioAtual && (
                <View style={{ marginBottom: 16, padding: 12, backgroundColor: tema.card, borderRadius: 12, borderWidth: 1, borderColor: tema.primary }}>
                  <Text style={{ color: tema.primary, fontWeight: '900', fontSize: 14, marginBottom: 8 }}>📅 Ciclo em andamento</Text>
                  <Text style={{ color: tema.text, fontSize: 13 }}>Início: {relatorioAtual.cicloInicio}</Text>
                  <Text style={{ color: tema.text, fontSize: 13 }}>Total tomados: {relatorioAtual.totalDiasTomados} dias</Text>
                  <Text style={{ color: '#00ff87', fontSize: 13 }}>✅ No horário certo: {relatorioAtual.diasNoHorarioCerto}</Text>
                  {relatorioAtual.diasForaDoHorario > 0 && <Text style={{ color: '#ffd60a', fontSize: 13 }}>⚠️ Fora do horário: {relatorioAtual.diasForaDoHorario}</Text>}
                  {relatorioAtual.diasPerdidos > 0 && <Text style={{ color: '#ff4444', fontSize: 13 }}>❌ Dias perdidos: {relatorioAtual.diasPerdidos}</Text>}
                  <Text style={{ color: tema.text, fontSize: 13, marginTop: 4 }}>Streak atual: {relatorioAtual.streak} 🔥</Text>
                  <Text style={{ color: tema.text, fontSize: 13 }}>Pontos: {relatorioAtual.pontos}</Text>
                  {relatorioAtual.diasTomados?.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: tema.sub, fontSize: 11, marginBottom: 4 }}>Dias tomados:</Text>
                      {relatorioAtual.diasTomados.map((d, i) => (
                        <Text key={i} style={{ color: d.certo ? '#00ff87' : '#ffd60a', fontSize: 11 }}>
                          {d.certo ? '✅' : '⚠️'} {d.data} às {d.hora}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
              {/* Histórico de relatórios anteriores */}
              {historicoRelatorios.length > 0 && (
                <View>
                  <Text style={{ color: tema.sub, fontWeight: '700', fontSize: 13, marginBottom: 8 }}>📁 Ciclos anteriores</Text>
                  {historicoRelatorios.map((rel, i) => (
                    <View key={rel.id || i} style={{ marginBottom: 12, padding: 10, backgroundColor: tema.card, borderRadius: 10, borderWidth: 1, borderColor: tema.border }}>
                      <Text style={{ color: tema.primary, fontWeight: '700', fontSize: 12 }}>Ciclo {i + 1} — {rel.cicloInicio} a {rel.cicloFim}</Text>
                      <Text style={{ color: tema.text, fontSize: 12 }}>✅ {rel.diasNoHorarioCerto} certos · ⚠️ {rel.diasForaDoHorario} errados · ❌ {rel.diasPerdidos} perdidos</Text>
                      <Text style={{ color: tema.sub, fontSize: 11 }}>Pausa: {rel.pausaInicio} → Retomada: {rel.retomadaEstimada}</Text>
                    </View>
                  ))}
                </View>
              )}
              {historicoRelatorios.length === 0 && !relatorioAtual?.totalDiasTomados && (
                <Text style={s.authSub}>Nenhum dado ainda. Comece a tomar a pílula para gerar relatórios!</Text>
              )}
            </ScrollView>
            <TouchableOpacity style={s.btnSecondary} onPress={() => setModalRelatorio(false)}>
              <Text style={s.btnSecondaryTxt}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal Perfil Usuário (Instagram style) ── */}
      <Modal transparent visible={modalPerfilUsuario} animationType="slide" onRequestClose={() => setModalPerfilUsuario(false)}>
        <View style={[s.modalWrap, { justifyContent: 'flex-end' }]}>
          <View style={[s.modalCard, { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: 40 }]}>
            <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 4, marginBottom: 8 }} onPress={() => setModalPerfilUsuario(false)}>
              <Text style={{ color: tema.sub, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            {perfilUsuarioVisto && <>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                {perfilUsuarioVisto.foto
                  ? <Image source={{ uri: perfilUsuarioVisto.foto }} style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: tema.primary }} />
                  : <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: tema.primary }}><Text style={{ fontSize: 40 }}>👤</Text></View>
                }
                {perfilUsuarioVisto.selo && (
                  <View style={{ marginTop: -16, backgroundColor: '#000a', borderRadius: 14, padding: 3, alignSelf: 'center' }}>
                    <Text style={{ fontSize: 20 }}>{ITENS_LOJA.selos.comum.concat(ITENS_LOJA.selos.raro, ITENS_LOJA.selos.lendario).find(s => s.id === perfilUsuarioVisto.selo)?.emoji || '✨'}</Text>
                  </View>
                )}
                <Text style={[s.perfilNome, { marginTop: 8 }]}>{perfilUsuarioVisto.nome}</Text>
                {perfilUsuarioVisto.titulo && (
                  <View style={{ alignItems: 'center', marginTop: 4 }}>
                    <View style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 12, color: perfilUsuarioVisto.titulo.cor || '#fff', fontWeight: '700' }}>{perfilUsuarioVisto.titulo.titulo}</Text>
                    </View>
                  </View>
                )}
                {perfilUsuarioVisto.moldura && (
                  <Text style={{ color: tema.sub, fontSize: 12, marginTop: 4 }}>🖼️ {[...ITENS_LOJA.molduras.comum, ...ITENS_LOJA.molduras.raro, ...ITENS_LOJA.molduras.lendario].find(m => m.id === perfilUsuarioVisto.moldura)?.nome || 'Moldura'}</Text>
                )}
              </View>
              <View style={[s.statsRow, { marginTop: 0 }]}>
                <View style={s.statItem}><Text style={s.statValue}>{perfilUsuarioVisto.pontos}</Text><Text style={s.statLabel}>Pontos</Text></View>
                <View style={s.statItem}><Text style={s.statValue}>{perfilUsuarioVisto.streak} 🔥</Text><Text style={s.statLabel}>Streak</Text></View>
                <View style={s.statItem}><Text style={s.statValue}>{perfilUsuarioVisto.antrix} 💠</Text><Text style={s.statLabel}>Antrix</Text></View>
              </View>
            </>}
          </View>
        </View>
      </Modal>

      {/* ── Modal Loja ── */}
      <Modal transparent visible={modalLoja} animationType="slide">
        <View style={s.modalWrap}>
          <ScrollView>
            <View style={s.modalCard}>
              <Text style={s.modalTitulo}>🛒 Loja</Text>
              <Text style={[s.statsInfo, { marginBottom: 16 }]}>Seus Antrix: {antrix} 💠</Text>

              <Text style={s.catTitulo}>🎨 Temas Comuns — 20 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.temas.comum.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                    <View style={[s.corTema, { backgroundColor: item.cor }]} />
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.temas.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.catTitulo}>💎 Temas Raros — 80 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.temas.raro.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                    <View style={[s.corTema, { backgroundColor: item.cor }]} />
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.temas.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.catTitulo}>✨ Temas Bonitos — 200 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.temas.bonito.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                    <View style={[s.corTema, { backgroundColor: item.cor }]} />
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.temas.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.catTitulo}>🏆 Temas Lendários — 500 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.temas.lendario.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                    <View style={[s.corTema, { backgroundColor: item.cor }]} />
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.temas.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.catTitulo}>🟢 Selos Comuns — 15 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.selos.comum.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.selos.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'selos')} disabled={itensComprados.selos.includes(item.id)}>
                    <Text style={{ fontSize: 28, marginBottom: 4 }}>{item.emoji}</Text>
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.selos.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.catTitulo}>🔵 Selos Raros — 60 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.selos.raro.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.selos.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'selos')} disabled={itensComprados.selos.includes(item.id)}>
                    <Text style={{ fontSize: 28, marginBottom: 4 }}>{item.emoji}</Text>
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.selos.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.catTitulo}>🟣 Selos Lendários — 300 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.selos.lendario.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.selos.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'selos')} disabled={itensComprados.selos.includes(item.id)}>
                    <Text style={{ fontSize: 28, marginBottom: 4 }}>{item.emoji}</Text>
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.selos.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.catTitulo}>🖼️ Molduras Comuns — 20 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.molduras.comum.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.molduras.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'molduras')} disabled={itensComprados.molduras.includes(item.id)}>
                    <View style={[s.corTema, { backgroundColor: item.cor !== 'rainbow' ? item.cor : '#ffaa44' }]} />
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.molduras.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.catTitulo}>✨ Molduras Raras — 80 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.molduras.raro.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.molduras.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'molduras')} disabled={itensComprados.molduras.includes(item.id)}>
                    <View style={[s.corTema, { backgroundColor: item.cor !== 'rainbow' ? item.cor : '#ffaa44' }]} />
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.molduras.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.catTitulo}>🌟 Molduras Lendárias — 300 💠</Text>
              <View style={s.lojaGrid}>
                {ITENS_LOJA.molduras.lendario.map(item => (
                  <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.molduras.includes(item.id) && s.lojaItemOwned]} onPress={() => comprarItem(item.id, item.preco, 'molduras')} disabled={itensComprados.molduras.includes(item.id)}>
                    <View style={[s.corTema, { backgroundColor: item.cor !== 'rainbow' ? item.cor : '#ffaa44' }]} />
                    <Text style={s.lojaNome}>{item.nome}</Text>
                    <Text style={s.lojaPreco}>{itensComprados.molduras.includes(item.id) ? '✓' : `${item.preco} 💠`}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[s.btnPrimary, { marginTop: 16 }]} onPress={() => setModalLoja(false)}>
                <Text style={s.btnPrimaryTxt}>Fechar loja</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal transparent visible={modalTema} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🎨 Escolher tema</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {/* Temas base sempre disponíveis */}
            {Object.entries(TEMAS_BASE).map(([id, t]) => (
              <TouchableOpacity key={id} style={[s.temaBtn, temaAtualId === id && { borderColor: t.primary }]} onPress={() => salvarTema(id)}>
                <View style={[s.temaCor, { backgroundColor: t.primary }]} />
                <Text style={s.temaTxt}>{id.charAt(0).toUpperCase() + id.slice(1)} (padrão)</Text>
              </TouchableOpacity>
            ))}
            {/* Temas comprados */}
            {itensComprados.temas.map(temaId => {
              const temaItem = getTemaById(temaId);
              if (!temaItem) return null;
              return (
                <TouchableOpacity key={temaId} style={[s.temaBtn, temaAtualId === temaId && { borderColor: temaItem.cor }]} onPress={() => salvarTema(temaId)}>
                  <View style={[s.temaCor, { backgroundColor: temaItem.cor }]} />
                  <Text style={s.temaTxt}>{temaItem.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalTema(false)}><Text style={s.btnSecondaryTxt}>Fechar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Admin */}
      <Modal transparent visible={modalAdmin} animationType="slide">
        <View style={s.modalWrap}><ScrollView><View style={s.modalCard}>
          <Text style={s.modalTitulo}>👑 Admin</Text>
          <TouchableOpacity style={s.adminBtn} onPress={() => { setModalAdmin(false); setModalInicio(true); }}><Text style={s.adminBtnTxt}>📅 Definir início da cartela</Text></TouchableOpacity>
          <TouchableOpacity style={s.adminBtn} onPress={() => { setModalAdmin(false); iniciarPausa(); }}><Text style={s.adminBtnTxt}>⏸️ Iniciar Pausa (4 dias)</Text></TouchableOpacity>
          {pausa?.ativa && <TouchableOpacity style={s.adminBtn} onPress={() => { setModalAdmin(false); despausar(); }}><Text style={s.adminBtnTxt}>▶️ Encerrar Pausa</Text></TouchableOpacity>}
          <TouchableOpacity style={s.adminBtn} onPress={adminLimparDiaHoje}><Text style={s.adminBtnTxt}>🗑️ Remover registro de hoje</Text></TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#ffaa00' }]} onPress={adminSetAntrixInfinito}><Text style={[s.adminBtnTxt, { color: '#ffaa00' }]}>💰 Antrix infinito (999999)</Text></TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#44ff44' }]} onPress={adminDesbloquearTodosItens}><Text style={[s.adminBtnTxt, { color: '#44ff44' }]}>🎨 Desbloquear todos itens</Text></TouchableOpacity>
          {/* 🆕 NOVO alpha 0.0.1: Botão desbloquear TODAS as conquistas */}
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#ffcc00' }]} onPress={async () => {
            const novas = {};
            const titulosNovos = {};
            for (const cat of Object.values(CONQUISTAS)) {
              for (const c of cat) {
                novas[c.id] = { desbloqueada: true, data: new Date().toISOString() };
                if (c.titulo) titulosNovos[c.id] = { titulo: c.titulo, cor: c.corTitulo || '#aaa' };
              }
            }
            setConquistasDesbloqueadas(novas);
            setTitulosDesbloqueados(prev => ({ ...prev, ...titulosNovos }));
            await set(ref(db, `usuarios/${authUser.uid}/conquistas`), novas);
            await update(ref(db, `usuarios/${authUser.uid}/titulosDesbloqueados`), titulosNovos);
            Alert.alert('✅ Admin', 'Todas as conquistas desbloqueadas!');
          }}>
            <Text style={[s.adminBtnTxt, { color: '#ffcc00' }]}>🏆 Desbloquear todas conquistas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#ff4444' }]} onPress={adminResetarLoja}><Text style={[s.adminBtnTxt, { color: '#ff4444' }]}>⚠️ Reset Antrix/Loja/Conquistas</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalAdmin(false)}><Text style={s.btnSecondaryTxt}>Fechar</Text></TouchableOpacity>
        </View></ScrollView></View>
      </Modal>

      {/* Modal Início */}
      <Modal transparent visible={modalInicio} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>📅 Início da cartela</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tema.sub, marginBottom: 8 }}>Mês</Text>
              <TouchableOpacity onPress={() => setPickerMes(m => (m + 1) % 12)}><Text style={{ color: tema.primary, fontSize: 24 }}>▲</Text></TouchableOpacity>
              <Text style={{ color: '#fff', fontSize: 18, marginVertical: 8 }}>{MESES[pickerMes].slice(0, 3)}</Text>
              <TouchableOpacity onPress={() => setPickerMes(m => (m - 1 + 12) % 12)}><Text style={{ color: tema.primary, fontSize: 24 }}>▼</Text></TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tema.sub, marginBottom: 8 }}>Dia</Text>
              <TouchableOpacity onPress={() => setPickerDia(d => Math.min(d + 1, diasNoMes(pickerMes, new Date().getFullYear())))}><Text style={{ color: tema.primary, fontSize: 24 }}>▲</Text></TouchableOpacity>
              <Text style={{ color: '#fff', fontSize: 18, marginVertical: 8 }}>{pickerDia}</Text>
              <TouchableOpacity onPress={() => setPickerDia(d => Math.max(d - 1, 1))}><Text style={{ color: tema.primary, fontSize: 24 }}>▼</Text></TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={definirDataInicio}><Text style={s.btnPrimaryTxt}>✅ Confirmar</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalInicio(false)}><Text style={s.btnSecondaryTxt}>Cancelar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Gênero */}
      <Modal transparent visible={modalGenero} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>👤 Qual é o seu gênero?</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={() => salvarGenero('mulher')}><Text style={s.btnPrimaryTxt}>👩 Mulher</Text></TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { backgroundColor: tema.accent, marginTop: 8 }]} onPress={() => salvarGenero('homem')}><Text style={s.btnPrimaryTxt}>👨 Homem</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => salvarGenero('nao_informado')}><Text style={s.btnSecondaryTxt}>Prefiro não informar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Horário — Picker */}
      <Modal transparent visible={modalHorario} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>⏰ Definir horário</Text>
          <Text style={{ color: tema.sub, fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
            Janela de Ouro: ±10 min deste horário
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setHorarioHH(h => String((parseInt(h)+1)%24).padStart(2,'0'))} style={{ padding: 12 }}>
                <Text style={{ color: tema.primary, fontSize: 28, fontWeight: '900' }}>▲</Text>
              </TouchableOpacity>
              {/* alpha 0.0.27: TextInput editável direto — toca o número e digita */}
              <TextInput
                style={{ color: '#fff', fontSize: 48, fontWeight: '900', width: 80, textAlign: 'center', padding: 0 }}
                value={horarioHH}
                onChangeText={v => {
                  const num = v.replace(/\D/g, '').slice(0, 2);
                  setHorarioHH(num);
                }}
                onBlur={() => {
                  const n = parseInt(horarioHH) || 0;
                  setHorarioHH(String(Math.min(23, n)).padStart(2, '0'));
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <TouchableOpacity onPress={() => setHorarioHH(h => String((parseInt(h)-1+24)%24).padStart(2,'0'))} style={{ padding: 12 }}>
                <Text style={{ color: tema.primary, fontSize: 28, fontWeight: '900' }}>▼</Text>
              </TouchableOpacity>
              <Text style={{ color: tema.sub, fontSize: 12 }}>hora</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900' }}>:</Text>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setHorarioMM(m => String((parseInt(m)+5)%60).padStart(2,'0'))} style={{ padding: 12 }}>
                <Text style={{ color: tema.primary, fontSize: 28, fontWeight: '900' }}>▲</Text>
              </TouchableOpacity>
              {/* alpha 0.0.27: TextInput editável direto — toca o número e digita */}
              <TextInput
                style={{ color: '#fff', fontSize: 48, fontWeight: '900', width: 80, textAlign: 'center', padding: 0 }}
                value={horarioMM}
                onChangeText={v => {
                  const num = v.replace(/\D/g, '').slice(0, 2);
                  setHorarioMM(num);
                }}
                onBlur={() => {
                  const n = parseInt(horarioMM) || 0;
                  setHorarioMM(String(Math.min(59, n)).padStart(2, '0'));
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <TouchableOpacity onPress={() => setHorarioMM(m => String((parseInt(m)-5+60)%60).padStart(2,'0'))} style={{ padding: 12 }}>
                <Text style={{ color: tema.primary, fontSize: 28, fontWeight: '900' }}>▼</Text>
              </TouchableOpacity>
              <Text style={{ color: tema.sub, fontSize: 12 }}>min</Text>
            </View>
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={() => {
            const hhFinal = String(Math.min(23, parseInt(horarioHH) || 0)).padStart(2,'0');
            const mmFinal = String(Math.min(59, parseInt(horarioMM) || 0)).padStart(2,'0');
            const h = `${hhFinal}:${mmFinal}`;
            setHorarioInput(h);
            salvarHorarioPessoal(h);
          }}>
            <Text style={s.btnPrimaryTxt}>✅ Salvar — {horarioHH}:{horarioMM}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalHorario(false)}>
            <Text style={s.btnSecondaryTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Selo */}
      <Modal transparent visible={modalSelo} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>✨ Equipar selo</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {itensComprados.selos.length === 0 && <Text style={s.authSub}>Compre selos na loja primeiro!</Text>}
            {itensComprados.selos.map(seloId => {
              const seloItem = getSeloById(seloId);
              if (!seloItem) return null;
              return (
                <TouchableOpacity key={seloId} style={[s.temaBtn, seloEquipado === seloId && { borderColor: tema.primary }]} onPress={() => equiparSelo(seloId)}>
                  <Text style={{ fontSize: 24, marginRight: 15 }}>{seloItem.emoji}</Text>
                  <Text style={s.temaTxt}>{seloItem.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalSelo(false)}><Text style={s.btnSecondaryTxt}>Fechar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Moldura */}
      <Modal transparent visible={modalMoldura} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🖼️ Equipar moldura</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {itensComprados.molduras.length === 0 && <Text style={s.authSub}>Compre molduras na loja primeiro!</Text>}
            {itensComprados.molduras.map(molduraId => {
              const molduraItem = getMolduraById(molduraId);
              if (!molduraItem) return null;
              return (
                <TouchableOpacity key={molduraId} style={[s.temaBtn, molduraEquipada === molduraId && { borderColor: tema.primary }]} onPress={() => equiparMoldura(molduraId)}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, marginRight: 15, backgroundColor: molduraItem.cor !== 'rainbow' ? molduraItem.cor : '#ffaa44' }} />
                  <Text style={s.temaTxt}>{molduraItem.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalMoldura(false)}><Text style={s.btnSecondaryTxt}>Fechar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Título */}
      <Modal transparent visible={modalTitulo} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🏅 Escolher título</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {Object.keys(titulosDesbloqueados).length === 0 && <Text style={s.authSub}>Desbloqueie conquistas para ganhar títulos!</Text>}
            {Object.entries(titulosDesbloqueados).map(([id, data]) => (
              <TouchableOpacity key={id} style={[s.temaBtn, tituloEquipado === id && { borderColor: tema.primary }]} onPress={() => equiparTitulo(id)}>
                <Text style={[s.temaTxt, { color: data.cor }]}>{data.titulo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalTitulo(false)}><Text style={s.btnSecondaryTxt}>Fechar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Ranking Global */}
      <Modal transparent visible={modalRanking} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🏆 Ranking Global</Text>
          {loadingRanking && <ActivityIndicator style={{ marginVertical: 20 }} />}
          <ScrollView style={{ maxHeight: 400 }}>
            {globalRanking.map((item, idx) => (
              <View key={idx} style={s.rankGlobalItem}>
                <Text style={s.rankPos}>{idx + 1}º</Text>
                <Text style={s.rankName}>{item.nome}</Text>
                <Text style={s.rankValue}>{item.pontos} pts</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalRanking(false)}><Text style={s.btnSecondaryTxt}>Fechar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerLeft} onPress={() => setAbaAtiva('perfil')}>
          <View style={{ position: 'relative', width: 44, height: 44 }}>
            {(() => {
              const moldura = molduraEquipada ? getMolduraById(molduraEquipada) : null;
              const corBorda = moldura ? (moldura.cor !== 'rainbow' ? moldura.cor : '#ffaa44') : tema.primary;
              return fotoAtual
                ? <Image source={{ uri: fotoAtual }} style={[s.avatarHeader, { borderWidth: 2, borderColor: corBorda }]} />
                : <View style={[s.avatarVazio, { borderWidth: 2, borderColor: corBorda }]}><Text>👤</Text></View>;
            })()}
            {seloEquipado && (
              <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#000a', borderRadius: 10, padding: 1 }}>
                <Text style={{ fontSize: 12 }}>{getSeloById(seloEquipado)?.emoji || '✨'}</Text>
              </View>
            )}
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={s.headerTitle}>{nomeAtual}</Text>
            <Text style={s.headerSub}>{parceiro ? `💞 ${parceiro.nome}` : 'Sem parceiro(a)'}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: tema.primary, fontWeight: 'bold', alignSelf: 'center' }}>{antrix} 💠</Text>
          <TouchableOpacity style={s.iconBtn} onPress={() => setModalTema(true)}><Text>🎨</Text></TouchableOpacity>
          {isAdmin && <TouchableOpacity style={[s.iconBtn, { backgroundColor: tema.primary }]} onPress={() => setModalAdmin(true)}><Text>👑</Text></TouchableOpacity>}
        </View>
      </View>

      <Animated.View style={{ flex: 1, transform: [{ translateX: swipeX }] }}>
      <ScrollView style={s.body} contentContainerStyle={s.bodyContent} {...panResponder.panHandlers}>

        {/* HOME */}
        {abaAtiva === 'home' && <>
          {/* 🆕 NOVO alpha 0.0.1: Countdown em segundos */}
          <View style={[s.countdownBar, naJanela && { backgroundColor: '#00ff8722', borderColor: '#00ff87' }]}>
            <Text style={[s.countdownTxt, naJanela && { color: '#00ff87', fontWeight: '900' }]}>{countdown}</Text>
          </View>

          {/* Mulher sem data de início — pode definir */}
          {ehMulher && !dataInicio && (
            <TouchableOpacity
              style={{ backgroundColor: '#7b2fff22', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#7b2fff', flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setModalInicio(true)}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Defina a data de início da cartela</Text>
                <Text style={{ color: tema.sub, fontSize: 11, marginTop: 2 }}>Toque aqui para iniciar o ciclo 💊</Text>
              </View>
              <Text style={{ color: '#7b2fff', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          )}

          {/* alpha 0.0.15: aviso para mulher sem horário definido */}
          {ehMulher && !meuHorario && (
            <TouchableOpacity
              style={{ backgroundColor: '#ff2d7822', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: tema.primary, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => { setHorarioInput(''); setModalHorario(true); }}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>⏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Coloque seu horário pessoal</Text>
                <Text style={{ color: tema.sub, fontSize: 11, marginTop: 2 }}>Toque aqui para definir e receber lembretes diários 💊</Text>
              </View>
              <Text style={{ color: tema.primary, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          )}

          {/* HOME MULHER */}
          {ehMulher && (pD > 0 ? (
            <View style={[s.card, { borderColor: '#ffd60a' }]}>
              <Text style={{ fontSize: 44 }}>⏸️</Text>
              <Text style={[s.cardTitulo, { color: '#ffd60a' }]}>Pausa ativa</Text>
              <Text style={s.cardSub}>{pD} dias restantes</Text>
            </View>
          ) : <>
            <ConsistencyCircle historico={historico} dataInicio={dataInicio} tema={tema} horario={meuHorario} />
            <View style={[s.card, { borderColor: tomouHoje ? '#00ff87' : naJanela ? '#00ff87' : tema.primary }]}>
              <Text style={{ fontSize: 48 }}>{tomouHoje ? '✅' : naJanela ? '🟢' : '⏰'}</Text>
              <Text style={s.cardTitulo}>{tomouHoje ? 'Tomou hoje!' : naJanela ? 'HORA DA PÍLULA!' : 'Ainda não tomou'}</Text>
              <Text style={s.cardSub}>Dia {diaCartela}/28</Text>
              {meuHorario && !tomouHoje && <Text style={[s.cardSub, { marginTop: 6, color: tema.accent }]}>⏰ Seu lembrete: {meuHorario}</Text>}
            </View>
            {!tomouHoje && (
              <Animated.View style={{ transform: [{ scale: pulseBtn }] }}>
                <TouchableOpacity
                  style={[s.btnPrimary, naJanela && { backgroundColor: '#00cc66' }]}
                  onPress={marcarTomou}
                >
                  <Text style={s.btnPrimaryTxt}>{naJanela ? '🟢 Marcar agora — Janela aberta!' : '💊 Marcar agora'}</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            {!pausa?.ativa && (
              <TouchableOpacity style={[s.btnSecondary, { marginTop: 8, borderColor: '#ffd60a' }]} onPress={analisarEIniciarPausa}>
                <Text style={[s.btnSecondaryTxt, { color: '#ffd60a' }]}>⏸️ Iniciar pausa</Text>
              </TouchableOpacity>
            )}
            {pausa?.ativa && (
              <TouchableOpacity style={[s.btnSecondary, { marginTop: 8, borderColor: '#ff4444' }]} onPress={despausar}>
                <Text style={[s.btnSecondaryTxt, { color: '#ff4444' }]}>▶️ Encerrar pausa</Text>
              </TouchableOpacity>
            )}
          </>)}

          {/* HOME HOMEM */}
          {!ehMulher && (<>
            {/* Card status da parceira */}
            {casalId && parceiro ? (<>
              <View style={[s.card, { borderColor: tomouHoje ? '#00ff87' : naJanela ? '#00ff87' : tema.primary }]}>
                <Text style={{ fontSize: 44 }}>{tomouHoje ? '✅' : naJanela ? '🟢' : '⏳'}</Text>
                <Text style={s.cardTitulo}>{parceiro.nome}</Text>
                <Text style={s.cardSub}>
                  {tomouHoje ? 'Tomou hoje! 🎉' : naJanela ? 'Hora da pílula dela!' : 'Ainda não tomou hoje'}
                </Text>
                {meuHorario && <Text style={[s.cardSub, { marginTop: 6, color: tema.accent }]}>⏰ Horário dela: {meuHorario}</Text>}
                <Text style={[s.cardSub, { marginTop: 4 }]}>Dia {diaCartela}/28 · Streak: {(() => { const streakParceiro = Object.values(pontos || {})[0] || 0; return streakParceiro; })()} pts</Text>
              </View>

              {/* ConsistencyCircle da parceira */}
              <ConsistencyCircle historico={historico} dataInicio={dataInicio} tema={tema} horario={meuHorario} />

              {/* Apoio diário */}
              <TouchableOpacity
                style={[s.btnPrimary, ultimoApoio === hoje && { opacity: 0.5 }]}
                onPress={enviarApoioDiario}
                disabled={ultimoApoio === hoje}
              >
                <Text style={s.btnPrimaryTxt}>
                  {ultimoApoio === hoje ? '💜 Apoio enviado hoje' : '💜 Enviar apoio diário (+3 💠)'}
                </Text>
              </TouchableOpacity>

              {/* Escudo de streak */}
              <TouchableOpacity
                style={[s.btnSecondary, { marginTop: 8, borderColor: escudosDisponiveis > 0 ? '#7b2fff' : '#444' }]}
                onPress={usarEscudoStreak}
              >
                <Text style={[s.btnSecondaryTxt, { color: escudosDisponiveis > 0 ? '#7b2fff' : '#555' }]}>
                  🛡️ Usar Escudo de Streak ({escudosDisponiveis} disponíveis)
                </Text>
              </TouchableOpacity>

            </>) : (
              /* Homem sem par */
              <View style={[s.card, { borderColor: tema.border }]}>
                <Text style={{ fontSize: 48 }}>🔗</Text>
                <Text style={s.cardTitulo}>Conecte-se</Text>
                <Text style={s.cardSub}>Paire com sua parceira para ver o status dela aqui</Text>
                <TouchableOpacity style={[s.btnPrimary, { marginTop: 16, width: '100%' }]} onPress={() => { setCodigoGerado(''); setPairInput(''); setModalConectar(true); }}>
                  <Text style={s.btnPrimaryTxt}>🔗 Conectar agora</Text>
                </TouchableOpacity>
              </View>
            )}
          </>)}
        </>}

        {/* CALENDÁRIO */}
        {abaAtiva === 'calendario' && <>
          <View style={s.calHeader}>
            <TouchableOpacity onPress={() => { if (calMes === 0) { setCalMes(11); setCalAno(a => a - 1); } else setCalMes(m => m - 1); }}><Text style={s.calNav}>‹</Text></TouchableOpacity>
            <Text style={s.calTitulo}>{MESES[calMes]} {calAno}</Text>
            <TouchableOpacity onPress={() => { if (calMes === 11) { setCalMes(0); setCalAno(a => a + 1); } else setCalMes(m => m + 1); }}><Text style={s.calNav}>›</Text></TouchableOpacity>
          </View>
          <View style={s.calGrid}>
            {['D','S','T','Q','Q','S','S'].map((d, i) => <View key={i} style={s.calDiaSemana}><Text style={s.calDiaSemanaT}>{d}</Text></View>)}
            {(() => {
              const start = new Date(calAno, calMes, 1).getDay();
              const days = diasNoMes(calMes, calAno); const cells = [];
              const hojeDate = new Date(); const hojeAno = hojeDate.getFullYear(); const hojeMes = hojeDate.getMonth(); const hojeDia = hojeDate.getDate();
              // Dias de pausa — só marca se admin iniciou (pausa.ativa === true)
              const pausaDias = new Set();
              if (pausa?.ativa && pausa?.inicio && pausa?.fim) {
                let cur = new Date(pausa.inicio + 'T12:00:00');
                const fim = new Date(pausa.fim + 'T12:00:00');
                while (cur <= fim) {
                  pausaDias.add(cur.toISOString().slice(0,10));
                  cur.setDate(cur.getDate() + 1);
                }
              }
              for (let i = 0; i < start; i++) cells.push(<View key={'e' + i} style={s.calCelVazia} />);
              for (let d = 1; d <= days; d++) {
                const key = `${calAno}-${String(calMes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const tomou = !!historico[key];
                const ehHoje = calAno === hojeAno && calMes === hojeMes && d === hojeDia;
                const ehPausa = pausaDias.has(key);
                cells.push(
                  <TouchableOpacity key={key} style={[s.calCel,
                    tomou && { backgroundColor: tema.primary + '44' },
                    ehHoje && { borderWidth: 2, borderColor: tema.primary },
                    ehPausa && !tomou && { backgroundColor: '#ffd60a22' }
                  ]} onPress={() => adminToggleDia(key)}>
                    <Text style={[s.calDiaNum, tomou && { color: tema.primary }, ehHoje && { fontWeight: '900', color: tema.primary }, ehPausa && !tomou && { color: '#ffd60a' }]}>{d}</Text>
                    {ehPausa && <Text style={{ fontSize: 8, color: '#ffd60a' }}>⏸</Text>}
                  </TouchableOpacity>
                );
              }
              return cells;
            })()}
          </View>
          {/* Legenda calendário */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 12, height: 12, backgroundColor: tema.primary + '44', borderRadius: 3 }}/><Text style={{ color: tema.sub, fontSize: 11 }}>Tomou</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 12, height: 12, borderWidth: 2, borderColor: tema.primary, borderRadius: 3 }}/><Text style={{ color: tema.sub, fontSize: 11 }}>Hoje</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 12, height: 12, backgroundColor: '#ffd60a22', borderRadius: 3 }}/><Text style={{ color: tema.sub, fontSize: 11 }}>⏸ Pausa</Text></View>
          </View>
        </>}

        {/* RANKING */}
        {abaAtiva === 'ranking' && <>
          <Text style={s.secLabel}>🏆 Ranking da dupla</Text>
          {/* Card - Eu */}
          <TouchableOpacity style={[s.rankCard, { borderLeftWidth: 4, borderLeftColor: tema.primary }]} onPress={() => { setPerfilUsuarioVisto({ uid: authUser?.uid, nome: nomeAtual, foto: fotos[authUser?.uid], selo: seloEquipado, moldura: molduraEquipada, titulo: tituloEquipado ? titulosDesbloqueados[tituloEquipado] : null, pontos: indPontos, streak, antrix }); setModalPerfilUsuario(true); }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {fotos[authUser?.uid]
                ? <View style={{ position: 'relative' }}>
                    <Image source={{ uri: fotos[authUser?.uid] }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: tema.primary }} />
                    {seloEquipado && <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#000a', borderRadius: 10, padding: 1 }}><Text style={{ fontSize: 12 }}>{ITENS_LOJA.selos.comum.concat(ITENS_LOJA.selos.raro, ITENS_LOJA.selos.lendario).find(s => s.id === seloEquipado)?.emoji || '✨'}</Text></View>}
                  </View>
                : <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: tema.primary }}><Text style={{ fontSize: 20 }}>👤</Text></View>
              }
              <View style={{ flex: 1 }}>
                <Text style={s.rankNome}>{nomeAtual} {perfil?.genero === 'mulher' ? '👩' : '👨'} <Text style={{ color: tema.sub, fontSize: 11 }}>(você)</Text></Text>
                <Text style={{ color: tema.sub, fontSize: 11 }}>Streak: {streak} 🔥 · {antrix} 💠</Text>
              </View>
            </View>
            <Text style={s.rankPts}>{indPontos} pts</Text>
          </TouchableOpacity>
          {/* Card - Parceiro (só se pareado) */}
          {parceiro ? (
            <TouchableOpacity style={[s.rankCard, { borderLeftWidth: 4, borderLeftColor: tema.accent }]} onPress={async () => {
              try {
                const snap = await get(ref(db, `usuarios/${parceiro.uid}`));
                if (snap.exists()) {
                  const p = snap.val();
                  setPerfilUsuarioVisto({ uid: parceiro.uid, nome: p.nome, foto: fotos[parceiro.uid], selo: p.seloEquipado, moldura: p.molduraEquipada, titulo: p.tituloEquipado ? p.titulosDesbloqueados?.[p.tituloEquipado] : null, pontos: p.indPontos || 0, streak: p.streak || 0, antrix: p.antrix || 0 });
                  setModalPerfilUsuario(true);
                }
              } catch(e) {}
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {fotos[parceiro.uid]
                  ? <View style={{ position: 'relative' }}>
                      <Image source={{ uri: fotos[parceiro.uid] }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: tema.accent }} />
                    </View>
                  : <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: tema.accent }}><Text style={{ fontSize: 20 }}>👤</Text></View>
                }
                <View style={{ flex: 1 }}>
                  <Text style={[s.rankNome, { color: tema.accent }]}>{parceiro.nome} 💞</Text>
                  <Text style={{ color: tema.sub, fontSize: 11 }}>Toque para ver perfil</Text>
                </View>
              </View>
              <Text style={[s.rankPts, { color: tema.accent }]}>? pts</Text>
            </TouchableOpacity>
          ) : (
            <View style={[s.rankCard, { borderLeftWidth: 4, borderLeftColor: '#444', opacity: 0.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>❓</Text></View>
                <View><Text style={[s.rankNome, { color: '#666' }]}>Sem parceiro(a)</Text><Text style={{ color: '#555', fontSize: 11 }}>Conecte-se a uma dupla</Text></View>
              </View>
            </View>
          )}
          <Text style={[s.authSub, { marginTop: 16, textAlign: 'left', color: tema.sub }]}>💡 Toque nos cards para ver o perfil completo.</Text>
        </>}

        {/* LOJA */}
        {/* CONQUISTAS */}
        {abaAtiva === 'conquistas' && <>
          <Text style={s.secLabel}>🏅 CONQUISTAS</Text>
          {Object.entries(CONQUISTAS).map(([categoria, lista]) => (
            <View key={categoria}>
              <Text style={s.catConquista}>{categoria.toUpperCase()}</Text>
              {lista.map(conq => {
                const desbloq = conquistasDesbloqueadas[conq.id];
                return (
                  <View key={conq.id} style={s.conquistaItem}>
                    <Text style={[s.conquistaNome, desbloq && s.conquistaDesbloq]}>{conq.nome}</Text>
                    {desbloq ? <Text style={s.conquistaCheck}>✅</Text> : <Text style={{ color: '#555', fontSize: 12 }}>🔒</Text>}
                  </View>
                );
              })}
            </View>
          ))}
        </>}

        {/* MURAL */}
        {abaAtiva === 'mural' && <>
          <Text style={s.secLabel}>💌 Mural da Dupla</Text>
          <Text style={[s.authSub, { textAlign: 'left', color: tema.sub, marginBottom: 8 }]}>Mensagens das últimas 24h</Text>
          {mensagensMural.length === 0 && <Text style={s.authSub}>Nenhuma mensagem ainda. Deixe um recado!</Text>}
          {mensagensMural.map(item => (
            <View key={item.id} style={[s.mensagemItem, { flexDirection: 'row', alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.mensagemUsuario}>{item.usuario}</Text>
                <Text style={s.mensagemTexto}>{item.texto}</Text>
                <Text style={s.mensagemData}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
              {isAdmin && (
                <TouchableOpacity onPress={() => deletarMensagem(item.id)} style={{ padding: 6, opacity: 0.6 }}>
                  <Text style={{ fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isAdmin && mensagensMural.length > 0 && (
            <TouchableOpacity style={[s.btnSecondary, { borderColor: '#ff4444', marginTop: 4 }]} onPress={adminLimparTodoMural}>
              <Text style={[s.btnSecondaryTxt, { color: '#ff4444' }]}>🗑️ Limpar todo o mural</Text>
            </TouchableOpacity>
          )}
          <TextInput style={[s.input, { marginTop: 10 }]} placeholder="Escreva uma mensagem..." placeholderTextColor="#555" value={novaMensagem} onChangeText={setNovaMensagem} multiline />
          <TouchableOpacity style={s.btnPrimary} onPress={enviarMensagem}><Text style={s.btnPrimaryTxt}>💌 Enviar</Text></TouchableOpacity>
        </>}

        {/* SUGESTÕES */}
        {abaAtiva === 'sugestoes' && <>
          <Text style={s.secLabel}>💡 Sugestões</Text>
          <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Escreva uma sugestão..." placeholderTextColor="#555" value={sugestao} onChangeText={setSugestao} multiline />
          <TouchableOpacity style={s.btnPrimary} onPress={enviarSugestao}><Text style={s.btnPrimaryTxt}>📤 Enviar</Text></TouchableOpacity>
        </>}

        {/* PERFIL */}
        {abaAtiva === 'perfil' && <>
          <View style={s.perfilCard}>
            {/* Banner pet secreto */}
            {pet?.bannerAtivo && <BannerPetSecreto tipo={pet.bannerAtivo} tema={tema} />}

            {/* Foto com pet orbital */}
            <TouchableOpacity onPress={escolherFotoGaleria} style={{ position: 'relative', width: 100, height: 100 }}>
              {(() => {
                const moldura = molduraEquipada ? getMolduraById(molduraEquipada) : null;
                const corBorda = moldura ? (moldura.cor !== 'rainbow' ? moldura.cor : '#ffaa44') : tema.primary;
                const larguraBorda = moldura ? 5 : 3;
                return fotoAtual
                  ? <Image source={{ uri: fotoAtual }} style={[s.fotoPerfil, { borderColor: corBorda, borderWidth: larguraBorda }]} />
                  : <View style={[s.fotoPerfilVazio, { borderColor: corBorda, borderWidth: larguraBorda }]}><Text style={{ fontSize: 40 }}>📷</Text></View>;
              })()}
              {seloEquipado && (
                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000a', borderRadius: 14, padding: 3 }}>
                  <Text style={{ fontSize: 18 }}>{getSeloById(seloEquipado)?.emoji || '✨'}</Text>
                </View>
              )}
              {/* Pet orbital ao redor da foto */}
              {pet && (
                <PetOrbital
                  pet={pet}
                  tamanho={100}
                  mostrarParceiro={!!(casalId && parceiro)}
                  petParceiro={null}
                />
              )}
            </TouchableOpacity>

            {/* Botão do pet */}
            <TouchableOpacity
              style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: tema.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: pet ? tema.primary : tema.border }}
              onPress={() => setModalPet(true)}
            >
              <Text style={{ fontSize: 16 }}>{pet ? (PET_FASES[pet.fase] || PET_FASES[1]).emoji : '🥚'}</Text>
              <Text style={{ color: pet ? tema.primary : tema.sub, fontSize: 12, fontWeight: '700' }}>
                {pet ? `${pet.nome || (PET_FASES[pet.fase] || PET_FASES[1]).nome} · F${pet.fase}` : 'Sem pet'}
              </Text>
            </TouchableOpacity>
            <Text style={s.perfilNome}>{nomeAtual}</Text>
            {/* alpha 0.0.27: título SOMENTE aqui (abaixo do nome), com contorno branco */}
            {tituloEquipado && titulosDesbloqueados[tituloEquipado] && (() => {
              const td = titulosDesbloqueados[tituloEquipado];
              if (tituloEquipado === 'amor_64') {
                const glowOpacity = tituloGlow.interpolate({ inputRange: [0,1], outputRange: [0.3,1] });
                const glowScale   = tituloGlow.interpolate({ inputRange: [0,1], outputRange: [0.97,1.03] });
                return (
                  <View style={{ alignItems: 'center', marginTop: 6 }}>
                    <Animated.View style={{ position:'absolute', width:220, height:36, borderRadius:10, borderWidth:1.5, borderColor:'#fff', opacity:glowOpacity, transform:[{scale:glowScale}], shadowColor:'#fff', shadowOffset:{width:0,height:0}, shadowOpacity:0.8, shadowRadius:10 }} />
                    <View style={s.tituloSecreto}><Text style={s.tituloSecretoTxt}>{td.titulo}</Text></View>
                  </View>
                );
              }
              // Título comum: badge com contorno branco abaixo do nome
              return (
                <View style={{ alignItems: 'center', marginTop: 6 }}>
                  <View style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 13, color: td.cor || '#fff', fontWeight: '700' }}>{td.titulo}</Text>
                  </View>
                </View>
              );
            })()}
            {perfil?.genero && <Text style={{ color: tema.sub, fontSize: 13, marginTop: 4 }}>{perfil.genero === 'mulher' ? '👩 Mulher' : perfil.genero === 'homem' ? '👨 Homem' : '⚪ Não informado'}</Text>}
            <View style={s.statsRow}>
              <View style={s.statItem}><Text style={s.statValue}>{indPontos}</Text><Text style={s.statLabel}>Pontos</Text></View>
              <View style={s.statItem}><Text style={s.statValue}>{antrix} 💠</Text><Text style={s.statLabel}>Antrix</Text></View>
              <View style={s.statItem}><Text style={s.statValue}>{streak} 🔥</Text><Text style={s.statLabel}>Streak</Text></View>
            </View>
          </View>

          {/* ── SETOR: Customização ── */}
          <Text style={s.setorTitulo}>🎮 Customização</Text>
          <View style={s.setorGrid}>
            <TouchableOpacity style={s.setorBtn} onPress={() => setModalSelo(true)}>
              <Text style={s.setorBtnIcon}>✨</Text>
              <Text style={s.setorBtnLabel}>Selos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.setorBtn} onPress={() => setModalMoldura(true)}>
              <Text style={s.setorBtnIcon}>🖼️</Text>
              <Text style={s.setorBtnLabel}>Molduras</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.setorBtn} onPress={() => setModalTitulo(true)}>
              <Text style={s.setorBtnIcon}>🏅</Text>
              <Text style={s.setorBtnLabel}>Títulos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.setorBtn} onPress={() => setModalLoja(true)}>
              <Text style={s.setorBtnIcon}>🛒</Text>
              <Text style={s.setorBtnLabel}>{antrix} 💠</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.setorBtn, { borderColor: pet ? tema.primary : '#ffd60a' }]} onPress={() => setModalCaixas(true)}>
              <Text style={s.setorBtnIcon}>📦</Text>
              <Text style={s.setorBtnLabel}>{pet ? 'Pet' : 'Caixas'}</Text>
            </TouchableOpacity>
            {pet && (
              <TouchableOpacity style={[s.setorBtn, { borderColor: tema.primary }]} onPress={() => setModalPet(true)}>
                <Text style={s.setorBtnIcon}>{(PET_FASES[pet.fase]||PET_FASES[1]).emoji}</Text>
                <Text style={s.setorBtnLabel}>Alimentar</Text>
              </TouchableOpacity>
            )}
          </View>



          {/* Input secreto oculto — sem label visível */}
          {!conquistasDesbloqueadas['amor_64'] && (
            <TextInput
              style={[s.input, { color: '#111', backgroundColor: '#111', borderColor: '#111', marginTop: 8 }]}
              placeholder="..." placeholderTextColor="#111"
              value={inputAmor64} onChangeText={setInputAmor64}
              onSubmitEditing={() => { verificarAmor64(inputAmor64); setInputAmor64(''); }}
              returnKeyType="done"
            />
          )}

          {/* ── SETOR: Configurações ── */}
          <Text style={s.setorTitulo}>⚙️ Configurações</Text>
          <View style={s.setorGrid}>
            {/* Botão horário — só mulher */}
            <TouchableOpacity
              style={[s.setorBtn, !ehMulher && { opacity: 0.5 }]}
              onPress={() => {
                if (!ehMulher) return;
                setHorarioInput(meuHorario || '');
                setModalHorario(true);
              }}
            >
              <Text style={s.setorBtnIcon}>⏰</Text>
              <Text style={s.setorBtnLabel}>
                {ehMulher
                  ? (meuHorario || 'Definir horário')
                  : (meuHorario ? meuHorario : '—')
                }
              </Text>
            </TouchableOpacity>
            {/* alpha 0.0.27: Início cartela liberado para qualquer mulher (não só admin) */}
            <TouchableOpacity
              style={[s.setorBtn, !ehMulher && { opacity: 0.5 }]}
              onPress={() => {
                if (!ehMulher) return;
                setModalInicio(true);
              }}
            >
              <Text style={s.setorBtnIcon}>📅</Text>
              <Text style={s.setorBtnLabel}>{dataInicio ? 'Cartela' : 'Início cartela'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.setorBtn} onPress={() => setModalGenero(true)}>
              <Text style={s.setorBtnIcon}>👤</Text>
              <Text style={s.setorBtnLabel}>Gênero</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.setorBtn} onPress={() => { setCodigoGerado(''); setPairInput(''); setModalConectar(true); }}>
              <Text style={s.setorBtnIcon}>🔗</Text>
              <Text style={s.setorBtnLabel}>Dupla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.setorBtn} onPress={carregarRankingGlobal}>
              <Text style={s.setorBtnIcon}>🏆</Text>
              <Text style={s.setorBtnLabel}>Global</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.setorBtn} onPress={abrirRelatorioMensal}>
              <Text style={s.setorBtnIcon}>📊</Text>
              <Text style={s.setorBtnLabel}>Relatório</Text>
            </TouchableOpacity>
          </View>

          {/* Loja abre via modal — botão na seção Customização acima */}

          {/* ── SETOR: Conta ── */}
          <Text style={s.setorTitulo}>👤 Conta</Text>
          <Text style={{ color: tema.sub, fontSize: 12, marginBottom: 12 }}>{perfil?.email}</Text>
          <TouchableOpacity style={[s.btnSecondary, { marginTop: 4 }]} onPress={fazerLogout}>
            <Text style={{ color: '#ff4444', fontWeight: '700' }}>🚪 Sair da conta</Text>
          </TouchableOpacity>
          <Text style={{ color: '#333', fontSize: 11, textAlign: 'center', marginTop: 16 }}>v{VERSAO_ATUAL}</Text>
          {temUpdate && (
            <TouchableOpacity style={{ backgroundColor: '#ff2d78', padding: 8, borderRadius: 8, marginTop: 8, alignItems: 'center' }} onPress={() => setModalOta(true)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>🚀 Atualização disponível: {otaInfo.versao}</Text>
              <Text style={{ color: '#fff', fontSize: 10 }}>Toque para baixar</Text>
            </TouchableOpacity>
          )}
        </>}

      </ScrollView>
      </Animated.View>

      {/* ── TAB BAR FIXA EMBAIXO ── */}
      <View style={s.tabBar}>
        {ABAS.map((aba) => {
          const icones = { home:'🏠', calendario:'📅', ranking:'🏆', conquistas:'🏅', mural:'💌', sugestoes:'💡', perfil:'👤' };
          const labels = { home:'Home', calendario:'Cal.', ranking:'Rank', conquistas:'Troféus', mural:'Mural', sugestoes:'Ideias', perfil:'Perfil' };
          const ativo = abaAtiva === aba;
          return (
            <TouchableOpacity key={aba} style={s.tabItem} onPress={() => { const idx = ABAS.indexOf(abaAtivaRef.current); const newIdx = ABAS.indexOf(aba); trocarAba(aba, newIdx >= idx ? 1 : -1); }}>
              {ativo && <View style={s.tabIndicator} />}
              <Text style={{ fontSize: 19, opacity: ativo ? 1 : 0.3 }}>{icones[aba]}</Text>
              <Text style={{ fontSize: 9, marginTop: 1, color: ativo ? tema.primary : tema.sub, fontWeight: ativo ? '700' : '400' }}>{labels[aba]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}
const makeStyles = (tema) => StyleSheet.create({
  root:            { flex: 1, backgroundColor: tema.bg, paddingTop: Platform.OS === 'android' ? 28 : 0 },
  splash:          { flex: 1, backgroundColor: '#0a0010', alignItems: 'center', justifyContent: 'center' },
  splashEmoji:     { fontSize: 64, marginBottom: 16 },
  splashTitle:     { fontSize: 28, fontWeight: '800', color: '#fff' },
  authWrap:        { flexGrow: 1, backgroundColor: '#0a0010', padding: 28, justifyContent: 'center' },
  authSub:         { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 28 },
  authSwitch:      { color: '#7b2fff', textAlign: 'center', marginTop: 16 },
  input:           { backgroundColor: tema.card, borderRadius: 12, padding: 16, color: tema.text, marginBottom: 12, borderWidth: 1, borderColor: tema.border },
  inputChave:      { textAlign: 'center', fontSize: 24, fontWeight: '800', letterSpacing: 6 },
  btnPrimary:      { backgroundColor: tema.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12 },
  btnPrimaryTxt:   { color: '#fff', fontWeight: '800' },
  btnSecondary:    { padding: 12, alignItems: 'center', marginTop: 8 },
  btnSecondaryTxt: { color: tema.sub },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, backgroundColor: tema.card },
  headerLeft:      { flexDirection: 'row', alignItems: 'center' },
  headerTitle:     { color: '#fff', fontWeight: '800', fontSize: 15 },
  headerSub:       { color: tema.sub, fontSize: 10 },
  avatarHeader:    { width: 46, height: 46, borderRadius: 23 },
  avatarVazio:     { width: 46, height: 46, borderRadius: 23, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  iconBtn:         { width: 34, height: 34, borderRadius: 17, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  tabBar:          { flexDirection: 'row', backgroundColor: tema.card, borderTopWidth: 1, borderTopColor: tema.border, paddingBottom: 8, paddingTop: 6 },
  tabItem:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2, position: 'relative' },
  tabIndicator:    { position: 'absolute', top: 0, width: 24, height: 2, backgroundColor: tema.primary, borderRadius: 1 },
  body:            { flex: 1 },
  bodyContent:     { padding: 14, paddingBottom: 20 },
  card:            { backgroundColor: tema.card, borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 2, marginBottom: 14 },
  cardTitulo:      { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 10 },
  cardSub:         { color: tema.sub, marginTop: 5 },
  secLabel:        { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  calHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calTitulo:       { color: '#fff', fontSize: 18, fontWeight: '800' },
  calNav:          { color: tema.primary, fontSize: 30, paddingHorizontal: 20 },
  calGrid:         { flexDirection: 'row', flexWrap: 'wrap' },
  calDiaSemana:    { width: (SW - 28) / 7, alignItems: 'center', marginBottom: 10 },
  calDiaSemanaT:   { color: tema.sub, fontSize: 12 },
  calCel:          { width: (SW - 28) / 7, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  calCelVazia:     { width: (SW - 28) / 7, height: 42 },
  calDiaNum:       { color: '#fff', fontSize: 14 },
  rankCard:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: tema.card, padding: 20, borderRadius: 16, marginBottom: 10 },
  rankNome:        { color: '#fff', fontWeight: '700' },
  rankPts:         { color: tema.primary, fontWeight: '800', fontSize: 20 },
  perfilCard:      { alignItems: 'center', padding: 24, backgroundColor: tema.card, borderRadius: 24, marginBottom: 8 },
  fotoPerfil:      { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: tema.primary },
  fotoPerfilVazio: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  perfilNome:      { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 15 },
  modalWrap:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard:       { backgroundColor: tema.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: tema.border },
  modalTitulo:     { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  modalAmor:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  modalAmorTxt:    { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 20 },
  temaBtn:         { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: tema.border, marginBottom: 10 },
  temaCor:         { width: 20, height: 20, borderRadius: 10, marginRight: 15 },
  temaTxt:         { color: '#fff', fontWeight: '600', flex: 1 },
  adminBtn:        { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: tema.primary, marginBottom: 10 },
  adminBtnTxt:     { color: tema.primary, textAlign: 'center', fontWeight: '700' },
  chaveBox:        { backgroundColor: tema.card, borderRadius: 20, padding: 24, alignItems: 'center', marginVertical: 12, borderWidth: 2, borderColor: tema.primary },
  chaveLabel:      { color: tema.sub, fontSize: 14, marginBottom: 8 },
  chaveValor:      { color: tema.primary, fontSize: 32, fontWeight: '900', letterSpacing: 8 },
  erroTxt:         { color: '#ff4444', textAlign: 'center', marginBottom: 10 },
  progressWrap:    { width: '100%', height: 8, backgroundColor: tema.border, borderRadius: 4, marginBottom: 16, overflow: 'hidden' },
  progressBar:     { height: '100%', backgroundColor: tema.primary, borderRadius: 4 },
  statsRow:        { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 15 },
  statItem:        { alignItems: 'center' },
  statValue:       { fontSize: 20, fontWeight: 'bold', color: tema.primary },
  statLabel:       { fontSize: 11, color: tema.sub, marginTop: 4 },
  conquistaItem:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tema.border },
  conquistaNome:   { color: tema.sub, fontSize: 12, flex: 1 },
  conquistaDesbloq:{ color: '#fff', fontWeight: 'bold' },
  conquistaCheck:  { color: '#00ff87', fontSize: 16, marginLeft: 8 },
  rankGlobalItem:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tema.border },
  rankPos:         { width: 36, fontSize: 14, fontWeight: 'bold', color: tema.primary },
  rankName:        { flex: 1, fontSize: 14, color: '#fff' },
  rankValue:       { fontSize: 14, fontWeight: 'bold', color: tema.primary },
  statsInfo:       { color: tema.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  catTitulo:       { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  catConquista:    { color: tema.primary, fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  lojaGrid:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  lojaItem:        { width: (SW - 42) / 2, backgroundColor: tema.card, borderRadius: 12, padding: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: tema.border },
  lojaItemOwned:   { opacity: 0.5 },
  corTema:         { width: 36, height: 36, borderRadius: 18, marginBottom: 8 },
  lojaNome:        { color: '#fff', fontSize: 11, textAlign: 'center' },
  lojaPreco:       { color: tema.primary, fontSize: 10, marginTop: 4 },
  mensagemItem:    { backgroundColor: tema.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: tema.border },
  mensagemUsuario: { color: tema.primary, fontWeight: 'bold', fontSize: 12 },
  mensagemTexto:   { color: '#fff', fontSize: 14, marginTop: 4 },
  mensagemData:    { color: tema.sub, fontSize: 10, marginTop: 4, textAlign: 'right' },
  countdownBar:    { backgroundColor: tema.card, borderRadius: 10, padding: 7, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: tema.border },
  countdownTxt:    { color: tema.sub, fontSize: 12, fontWeight: '700' },

  // ── Novos styles alpha 0.0.14 ──
  setorTitulo:     { color: '#fff', fontSize: 13, fontWeight: '800', marginTop: 20, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  setorGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  setorBtn:        { flex: 1, minWidth: '45%', backgroundColor: tema.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: tema.border },
  setorBtnIcon:    { fontSize: 28, marginBottom: 6 },
  setorBtnLabel:   { color: tema.sub, fontSize: 11, fontWeight: '700' },

  tituloSecreto:   {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#fff',
    // Efeito relevo via sombras
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 12,
  },
  tituloSecretoTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});


import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, Modal, Animated, Image,
  ActivityIndicator, Dimensions, PanResponder, StatusBar, FlatList
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
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from 'firebase/auth';

// ─── Firebase Config ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyChpMCwE1A8Yl3Cm4Oyhc0bJoXBJLSbPuo",
  authDomain: "pilula-ana.firebaseapp.com",
  databaseURL: "https://pilula-ana-default-rtdb.firebaseio.com",
  projectId: "pilula-ana",
  storageBucket: "pilula-ana.firebasestorage.app",
  messagingSenderId: "1005101278287",
  appId: "1:1005101278287:android:e749bbfad114aacbfd763a"
};

let firebaseApp, db, auth;
try {
  firebaseApp = initializeApp(firebaseConfig);
  db = getDatabase(firebaseApp);
  auth = getAuth(firebaseApp);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const VERSAO_ATUAL  = "6.0.0";
const ADMIN_EMAIL   = "Harlleyduarte@gmail.com";
const JANELA_INICIO = { h: 20, m: 30 };
const JANELA_FIM    = { h: 20, m: 40 };
const { width: SW } = Dimensions.get('window');

// ─── Themes (base) ────────────────────────────────────────────────────────────
const TEMAS_BASE = {
  roxo:   { primary:'#ff2d78', bg:'#0a0010', card:'#130020', border:'#2a1040', accent:'#7b2fff', text:'#fff', sub:'#aa88cc' },
  dourado:{ primary:'#ffd60a', bg:'#0a0800', card:'#1a1200', border:'#3a2a00', accent:'#ff9500', text:'#fff', sub:'#ccaa44' },
  ciano:  { primary:'#00e5ff', bg:'#000a10', card:'#001520', border:'#003040', accent:'#0088cc', text:'#fff', sub:'#44aacc' },
  verde:  { primary:'#00ff87', bg:'#000a05', card:'#001510', border:'#003020', accent:'#00cc66', text:'#fff', sub:'#44cc88' },
};

// ─── LOJA: Itens completos (temas, selos, molduras) ──────────────────────────────
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
      { id: 'ana_harlley', nome: 'Ana & Harlley', preco: 500, cor: '#ff2d78' },
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
      { id: 'assinatura_ana', nome: 'Emoji assinatura Ana', preco: 300, emoji: '👩‍❤️‍👨' },
      { id: 'assinatura_harlley', nome: 'Emoji assinatura Harlley', preco: 300, emoji: '💘' }
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
      { id: 'moldura_arcoiris', nome: 'Moldura Arco-íris', preco: 80, cor: 'rainbow', estilo: 'gradient' },
      { id: 'moldura_glitch', nome: 'Moldura Glitch', preco: 80, cor: '#ff00ff', estilo: 'solid' },
      { id: 'moldura_neon', nome: 'Moldura Neon', preco: 80, cor: '#00ffcc', estilo: 'solid' }
    ],
    lendario: [
      { id: 'moldura_galaxia', nome: 'Moldura Galáxia', preco: 300, cor: '#aa88ff', estilo: 'solid' },
      { id: 'moldura_amor_eterno', nome: 'Moldura Amor Eterno', preco: 300, cor: '#ff66cc', estilo: 'solid' },
      { id: 'moldura_casamento', nome: 'Moldura Casamento', preco: 300, cor: '#fff0f0', estilo: 'solid' },
      { id: 'moldura_rainbow', nome: 'Moldura Rainbow', preco: 300, cor: 'rainbow', estilo: 'gradient' },
      { id: 'moldura_diamante', nome: 'Moldura Diamante', preco: 300, cor: '#b9f2ff', estilo: 'solid' },
      { id: 'moldura_sonho', nome: 'Moldura Sonho', preco: 300, cor: '#cbaacb', estilo: 'solid' },
      { id: 'moldura_lua', nome: 'Moldura Lua', preco: 300, cor: '#f5e6d3', estilo: 'solid' },
      { id: 'moldura_sol', nome: 'Moldura Sol', preco: 300, cor: '#ffaa44', estilo: 'solid' },
      { id: 'moldura_estrela_cadente', nome: 'Moldura Estrela Cadente', preco: 300, cor: '#ffcc88', estilo: 'solid' },
      { id: 'moldura_criador', nome: 'Moldura Criador', preco: 300, cor: '#ff2d78', estilo: 'solid' }
    ],
    secreto: [
      { id: 'moldura_anjo_rosa', nome: 'Moldura Anjo Rosa', preco: 0, cor: '#ffb7c5', estilo: 'solid', animado: true },
      { id: 'moldura_rainha_jogo', nome: 'Moldura Rainha do Jogo', preco: 0, cor: '#ffd966', estilo: 'solid', animado: true },
      { id: 'moldura_lenda_absoluta', nome: 'Moldura Lenda Absoluta', preco: 0, cor: '#ffaa44', estilo: 'gradient', animado: true }
    ]
  }
};

// ─── CONQUISTAS (com títulos) ──────────────────────────────────────────────────
const CONQUISTAS = {
  streak: [
    { id: 'streak3', nome: '3 dias seguidos', titulo: 'Iniciante', corTitulo: '#aaa', cond: (s) => s.streak >= 3, recompensa: { antrix: 20 } },
    { id: 'streak5', nome: '5 dias seguidos', titulo: 'Persistente', corTitulo: '#ccc', cond: (s) => s.streak >= 5, recompensa: { antrix: 20 } },
    { id: 'streak7', nome: '7 dias seguidos', titulo: 'Disciplinado', corTitulo: '#ffaa66', cond: (s) => s.streak >= 7, recompensa: { antrix: 50 } },
    { id: 'streak10', nome: '10 dias seguidos', titulo: 'Dedicado', corTitulo: '#ffaa66', cond: (s) => s.streak >= 10, recompensa: { antrix: 50 } },
    { id: 'streak15', nome: '15 dias seguidos', titulo: 'Comprometido', corTitulo: '#ffaa66', cond: (s) => s.streak >= 15, recompensa: { antrix: 100 } },
    { id: 'streak20', nome: '20 dias seguidos', titulo: 'Inabalável', corTitulo: '#ffaa66', cond: (s) => s.streak >= 20, recompensa: { antrix: 100 } },
    { id: 'streak30', nome: '30 dias seguidos', titulo: 'Herói da Rotina', corTitulo: '#ffaa66', cond: (s) => s.streak >= 30, recompensa: { antrix: 200 } },
    { id: 'streak45', nome: '45 dias seguidos', titulo: 'Guardião', corTitulo: '#ffaa66', cond: (s) => s.streak >= 45, recompensa: { antrix: 200 } },
    { id: 'streak60', nome: '60 dias seguidos', titulo: 'Mestre do Tempo', corTitulo: '#ffaa66', cond: (s) => s.streak >= 60, recompensa: { antrix: 300 } },
    { id: 'streak90', nome: '90 dias seguidos', titulo: 'Lenda Viva', corTitulo: '#ffaa66', cond: (s) => s.streak >= 90, recompensa: { antrix: 400 } },
    { id: 'streak120', nome: '120 dias seguidos', titulo: 'Imortal', corTitulo: '#ffaa66', cond: (s) => s.streak >= 120, recompensa: { antrix: 500 } },
    { id: 'streak180', nome: '180 dias seguidos', titulo: 'Semideus', corTitulo: '#ffaa66', cond: (s) => s.streak >= 180, recompensa: { antrix: 700 } },
    { id: 'streak365', nome: '365 dias seguidos', titulo: 'Deus da Consistência', corTitulo: '#ffaa66', cond: (s) => s.streak >= 365, recompensa: { antrix: 1000 } }
  ],
  ranking: [
    { id: 'rank1_1', nome: 'Ficar em 1º lugar 1 vez', titulo: 'Campeão', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiro >= 1, recompensa: { antrix: 40 } },
    { id: 'rank1_3', nome: 'Ficar em 1º lugar 3 vezes', titulo: 'Tricampeão', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiro >= 3, recompensa: { antrix: 40 } },
    { id: 'rank1_5', nome: 'Ficar em 1º lugar 5 vezes', titulo: 'Pentacampeão', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiro >= 5, recompensa: { antrix: 60 } },
    { id: 'rank1_10', nome: 'Ficar em 1º lugar 10 vezes', titulo: 'Lenda do Ranking', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiro >= 10, recompensa: { antrix: 100 } },
    { id: 'rank1_20', nome: 'Ficar em 1º lugar 20 vezes', titulo: 'Invencível', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiro >= 20, recompensa: { antrix: 150 } },
    { id: 'rank1_30', nome: 'Ficar em 1º lugar 30 vezes', titulo: 'Imperador', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiro >= 30, recompensa: { antrix: 200 } },
    { id: 'rank1_50', nome: 'Ficar em 1º lugar 50 vezes', titulo: 'Rei do App', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiro >= 50, recompensa: { antrix: 300 } }
  ],
  antrix: [
    { id: 'antrix100', nome: 'Juntar 100 Antrix', titulo: 'Colecionador', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 100, recompensa: { antrix: 0 } },
    { id: 'antrix250', nome: 'Juntar 250 Antrix', titulo: 'Acumulador', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 250, recompensa: { antrix: 0 } },
    { id: 'antrix500', nome: 'Juntar 500 Antrix', titulo: 'Tesoureiro', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 500, recompensa: { antrix: 0 } },
    { id: 'antrix750', nome: 'Juntar 750 Antrix', titulo: 'Magnata', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 750, recompensa: { antrix: 0 } },
    { id: 'antrix1000', nome: 'Juntar 1000 Antrix', titulo: 'Barão', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 1000, recompensa: { antrix: 0 } },
    { id: 'antrix1500', nome: 'Juntar 1500 Antrix', titulo: 'Conde', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 1500, recompensa: { antrix: 0 } },
    { id: 'antrix2000', nome: 'Juntar 2000 Antrix', titulo: 'Príncipe', corTitulo: '#aaa', cond: (s) => s.antrixTotal >= 2000, recompensa: { antrix: 0 } }
  ],
  compras: [
    { id: 'comprar1tema', nome: 'Comprar 1 tema', titulo: 'Estiloso', corTitulo: '#aaa', cond: (s) => s.totalTemasComprados >= 1, recompensa: { antrix: 30 } },
    { id: 'comprar3temas', nome: 'Comprar 3 temas', titulo: 'Colecionador de Estilos', corTitulo: '#aaa', cond: (s) => s.totalTemasComprados >= 3, recompensa: { antrix: 30 } },
    { id: 'comprar5temas', nome: 'Comprar 5 temas', titulo: 'Fashionista', corTitulo: '#aaa', cond: (s) => s.totalTemasComprados >= 5, recompensa: { antrix: 50 } },
    { id: 'comprar10temas', nome: 'Comprar 10 temas', titulo: 'Guardião da Moda', corTitulo: '#aaa', cond: (s) => s.totalTemasComprados >= 10, recompensa: { antrix: 80 } },
    { id: 'comprar1temararo', nome: 'Comprar 1 tema raro', titulo: 'Raridade', corTitulo: '#aaa', cond: (s) => s.totalTemasRarosComprados >= 1, recompensa: { antrix: 50 } },
    { id: 'comprar3temasraros', nome: 'Comprar 3 temas raros', titulo: 'Caçador de Raros', corTitulo: '#aaa', cond: (s) => s.totalTemasRarosComprados >= 3, recompensa: { antrix: 100 } },
    { id: 'comprar1temalendario', nome: 'Comprar 1 tema lendário', titulo: 'Lendário', corTitulo: '#ffaa44', cond: (s) => s.totalTemasLendariosComprados >= 1, recompensa: { antrix: 150 } },
    { id: 'comprar3temaslendarios', nome: 'Comprar 3 temas lendários', titulo: 'Mito Vivo', corTitulo: '#ffaa44', cond: (s) => s.totalTemasLendariosComprados >= 3, recompensa: { antrix: 300 } }
  ],
  app: [
    { id: 'criar_conta', nome: 'Criar conta', titulo: 'Bem-vindo', corTitulo: '#aaa', cond: () => true, recompensa: { antrix: 10 } },
    { id: 'login3dias', nome: 'Fazer login 3 dias seguidos', titulo: 'Assíduo', corTitulo: '#aaa', cond: (s) => s.loginStreak >= 3, recompensa: { antrix: 20 } },
    { id: 'login7dias', nome: 'Fazer login 7 dias seguidos', titulo: 'Fiel', corTitulo: '#aaa', cond: (s) => s.loginStreak >= 7, recompensa: { antrix: 40 } },
    { id: 'login15dias', nome: 'Fazer login 15 dias seguidos', titulo: 'Leal', corTitulo: '#aaa', cond: (s) => s.loginStreak >= 15, recompensa: { antrix: 80 } },
    { id: 'perfeito5', nome: 'Tomar no horário perfeito 5 vezes', titulo: 'Pontual', corTitulo: '#aaa', cond: (s) => s.tomadasHorarioPerfeito >= 5, recompensa: { antrix: 50 } },
    { id: 'perfeito10', nome: 'Tomar no horário perfeito 10 vezes', titulo: 'Cronômetro', corTitulo: '#aaa', cond: (s) => s.tomadasHorarioPerfeito >= 10, recompensa: { antrix: 100 } },
    { id: 'perfeito30', nome: 'Tomar no horário perfeito 30 vezes', titulo: 'Mestre do Tempo', corTitulo: '#aaa', cond: (s) => s.tomadasHorarioPerfeito >= 30, recompensa: { antrix: 200 } },
    { id: 'perfeito100', nome: 'Tomar no horário perfeito 100 vezes', titulo: 'Senhor do Relógio', corTitulo: '#aaa', cond: (s) => s.tomadasHorarioPerfeito >= 100, recompensa: { antrix: 500 } },
    { id: 'usar3temas', nome: 'Usar 3 temas diferentes', titulo: 'Versátil', corTitulo: '#aaa', cond: (s) => s.temasDiferentesUsados >= 3, recompensa: { antrix: 30 } },
    { id: 'usar5temas', nome: 'Usar 5 temas diferentes', titulo: 'Caleidoscópio', corTitulo: '#aaa', cond: (s) => s.temasDiferentesUsados >= 5, recompensa: { antrix: 50 } }
  ],
  secretas: [
    { id: '10_ranking_seguido', nomeSecreto: '???', nomeRevelado: 'Ganhar 10 vezes seguidas no ranking', tituloSecreto: 'Invencível', corTitulo: '#ffaa44', cond: (s) => s.rankPrimeiroConsecutivo >= 10, recompensa: { tema: 'tema_favorita', moldura: 'moldura_anjo_rosa' } },
    { id: '30dias_sem_erro', nomeSecreto: '???', nomeRevelado: 'Ficar 30 dias seguidos sem errar horário', tituloSecreto: 'Anjo Pontual', corTitulo: '#ffb7c5', cond: (s) => s.diasSemErroHorario >= 30, recompensa: { tema: 'tema_anjo_rosa', moldura: 'moldura_rainha_jogo' } },
    { id: '2000_antrix_sem_gastar', nomeSecreto: '???', nomeRevelado: 'Juntar 2000 Antrix sem gastar', tituloSecreto: 'Acumulador Lendário', corTitulo: '#ffaa44', cond: (s) => s.antrixSemGastar >= 2000, recompensa: { tema: 'tema_rainha_jogo', moldura: 'moldura_lenda_absoluta' } },
    { id: '10_temas_lendarios', nomeSecreto: '???', nomeRevelado: 'Comprar 10 temas lendários', tituloSecreto: 'Colecionador Lendário', corTitulo: '#ffaa44', cond: (s) => s.totalTemasLendariosComprados >= 10, recompensa: { tema: 'tema_criadora_amor', moldura: 'moldura_galaxia' } },
    { id: '365_dias_streak', nomeSecreto: '???', nomeRevelado: 'Chegar em 365 dias seguidos', tituloSecreto: 'Lenda Absoluta', corTitulo: '#ffaa44', cond: (s) => s.streak >= 365, recompensa: { tema: 'tema_lenda_absoluta', moldura: 'moldura_estrela_cadente' } }
  ]
};

// Mapeamento de recompensas especiais
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

// Helper para buscar item por id
const getItemById = (tipo, id) => {
  for (let cat of Object.values(ITENS_LOJA[tipo])) {
    const found = cat.find(i => i.id === id);
    if (found) return found;
  }
  return null;
};

const getTemaById = (id) => getItemById('temas', id);
const getSeloById = (id) => getItemById('selos', id);
const getMolduraById = (id) => getItemById('molduras', id) || RECOMPENSAS_ESPECIAIS[id];

// ─── Date Helpers ─────────────────────────────────────────────────────────────
const dateToKey = d => d.toISOString().slice(0, 10);
const todayKey  = () => dateToKey(new Date());
const addDias   = (key, n) => {
  try {
    const d = new Date(key + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return dateToKey(d);
  } catch(e) { return key; }
};
const diasNoMes = (mes, ano) => new Date(ano, mes + 1, 0).getDate();
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ─── Game Logic Helpers ───────────────────────────────────────────────────────
const estaDentroJanela = (horario, tolerMin = 10, agora = new Date()) => {
  if (!horario) return false;
  const [h, m] = horario.split(':').map(Number);
  const r = new Date(agora);
  r.setHours(h, m, 0, 0);
  return Math.abs(agora.getTime() - r.getTime()) / 60000 <= tolerMin;
};

const versaoMaior = (nova, atual) => {
  if (!nova || !atual) return false;
  const p = v => v.split('.').map(Number);
  const [maN, miN, ptN] = p(nova);
  const [maA, miA, ptA] = p(atual);
  if (maN !== maA) return maN > maA;
  if (miN !== miA) return miN > miA;
  return ptN > ptA;
};

// ─── Notification Handler ─────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// ══════════════════════════════════════════════════════════════════════════════
// CONSISTENCY CIRCLE (mesmo código original)
// ══════════════════════════════════════════════════════════════════════════════
function ConsistencyCircle({ historico, dataInicio, tema }) {
  const TOTAL  = 28;
  const RADIUS = (SW - 80) / 2;
  const DOT    = 14;
  const anim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, []);

  const scale   = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const hoje = todayKey();

  const getDayKey = (idx) => {
    if (!dataInicio) return null;
    const d = new Date(dataInicio + 'T12:00:00');
    d.setDate(d.getDate() + idx - 1);
    return dateToKey(d);
  };

  const totalTomou = Object.values(historico).filter(e => e?.tomou).length;
  const diasPassados = (() => {
    if (!dataInicio) return 0;
    const diff = Math.floor((new Date(hoje + 'T12:00:00') - new Date(dataInicio + 'T12:00:00')) / 86400000);
    return Math.min(Math.max(diff + 1, 0), TOTAL);
  })();
  const consistencia = diasPassados > 0 ? Math.round((totalTomou / diasPassados) * 100) : 0;

  const dots = Array.from({ length: TOTAL }, (_, i) => {
    const idx   = i + 1;
    const angle = ((idx - 1) / TOTAL) * 2 * Math.PI - Math.PI / 2;
    const x     = RADIUS + Math.cos(angle) * RADIUS - DOT / 2;
    const y     = RADIUS + Math.sin(angle) * RADIUS - DOT / 2;
    const key   = getDayKey(idx);
    const tomou = key ? !!historico[key]?.tomou : false;
    const eHoje = key === hoje;
    const futuro = key ? key > hoje : true;
    let cor = tema.border;
    if (tomou) cor = tema.primary;
    else if (!futuro && key) cor = '#ff4444';
    return { x, y, tomou, eHoje, cor };
  });

  return (
    <Animated.View style={{
      width: RADIUS * 2, height: RADIUS * 2, alignSelf: 'center',
      transform: [{ scale }], opacity, marginBottom: 16,
    }}>
      <View style={{
        position: 'absolute', width: RADIUS * 2, height: RADIUS * 2,
        borderRadius: RADIUS, borderWidth: 2, borderColor: tema.border,
      }} />
      {dots.map((d, i) => (
        <View key={i} style={{
          position: 'absolute', left: d.x, top: d.y,
          width: DOT, height: DOT, borderRadius: DOT / 2,
          backgroundColor: d.cor,
          borderWidth: d.eHoje ? 2 : 0, borderColor: '#ffd60a',
          elevation: d.tomou ? 4 : 0,
        }} />
      ))}
      <View style={{
        position: 'absolute',
        top: RADIUS - RADIUS * 0.38, left: RADIUS - RADIUS * 0.38,
        width: RADIUS * 0.76, height: RADIUS * 0.76,
        borderRadius: RADIUS * 0.38,
        backgroundColor: tema.card,
        borderWidth: 1, borderColor: tema.border,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: tema.primary, fontSize: 28, fontWeight: '900' }}>{consistencia}%</Text>
        <Text style={{ color: tema.sub, fontSize: 11, marginTop: 2 }}>consistência</Text>
        <Text style={{ color: tema.text, fontSize: 13, fontWeight: '700', marginTop: 4 }}>
          {totalTomou}/28
        </Text>
      </View>
    </Animated.View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth & Pair ─────────────────────────────────────────────────────────────
  const [tela, setTela]           = useState('splash');
  const [authUser, setAuthUser]   = useState(null);
  const [perfil, setPerfil]       = useState(null);
  const [casalId, setCasalId]     = useState(null);
  const [parceiro, setParceiro]   = useState(null);

  // ── Auth form ───────────────────────────────────────────────────────────────
  const [authMode, setAuthMode]       = useState('login');
  const [authEmail, setAuthEmail]     = useState('');
  const [authSenha, setAuthSenha]     = useState('');
  const [authNome, setAuthNome]       = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authErro, setAuthErro]       = useState('');

  // ── Pair / Conectar ─────────────────────────────────────────────────────────
  const [pairStep, setPairStep]       = useState('menu');
  const [pairChave, setPairChave]     = useState('');
  const [pairInput, setPairInput]     = useState('');
  const [pairLoading, setPairLoading] = useState(false);
  const [codigoGerado, setCodigoGerado] = useState('');

  // ── App data ────────────────────────────────────────────────────────────────
  const [historico, setHistorico]     = useState({});
  const [pausa, setPausa]             = useState(null);
  const [pontos, setPontos]           = useState({ ana: 0, harlley: 0 });
  const [dataInicio, setDataInicio]   = useState(null);
  const [fotos, setFotos]             = useState({});
  const [temaAtualId, setTemaAtualId] = useState('roxo');
  const [tema, setTemaState]          = useState(TEMAS_BASE.roxo);
  const [sugestao, setSugestao]       = useState('');
  const [abaAtiva, setAbaAtiva]       = useState('home');
  const [adminUsers, setAdminUsers]   = useState([]);
  const [casalConfig, setCasalConfig] = useState({});

  // ── Novos estados (Loja, Conquistas, Molduras, Títulos, Mural) ───────────────
  const [antrix, setAntrix]           = useState(0);
  const [indPontos, setIndPontos]     = useState(0);
  const [streak, setStreak]           = useState(0);
  const [itensComprados, setItensComprados] = useState({ temas: [], selos: [], molduras: [] });
  const [seloEquipado, setSeloEquipado] = useState(null);
  const [molduraEquipada, setMolduraEquipada] = useState(null);
  const [titulosDesbloqueados, setTitulosDesbloqueados] = useState({}); // id -> { titulo, cor, animado }
  const [tituloEquipado, setTituloEquipado] = useState(null);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState({});
  const [estatisticas, setEstatisticas] = useState({
    rankPrimeiro: 0,
    rankPrimeiroConsecutivo: 0,
    antrixTotal: 0,
    totalTemasComprados: 0,
    totalTemasRarosComprados: 0,
    totalTemasLendariosComprados: 0,
    totalSelosComprados: 0,
    totalMoldurasCompradas: 0,
    tomadasHorarioPerfeito: 0,
    temasDiferentesUsados: new Set(),
    loginStreak: 0,
    diasSemErroHorario: 0,
    antrixSemGastar: 0,
  });
  const [mensagensMural, setMensagensMural] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [modalLoja, setModalLoja]     = useState(false);
  const [modalRanking, setModalRanking] = useState(false);
  const [globalRanking, setGlobalRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [modalSelo, setModalSelo] = useState(false);
  const [modalMoldura, setModalMoldura] = useState(false);
  const [modalTitulo, setModalTitulo] = useState(false);

  // ── OTA ─────────────────────────────────────────────────────────────────────
  const [otaInfo, setOtaInfo]         = useState(null);
  const [modalOta, setModalOta]       = useState(false);
  const [otaProgress, setOtaProgress] = useState(0);
  const versaoIgnoradaRef             = useRef(null);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [pickerMes, setPickerMes]       = useState(new Date().getMonth());
  const [pickerDia, setPickerDia]       = useState(1);
  const [calMes, setCalMes]             = useState(new Date().getMonth());
  const [calAno, setCalAno]             = useState(new Date().getFullYear());
  const [modalAmor, setModalAmor]       = useState(false);
  const [modalTema, setModalTema]       = useState(false);
  const [modalAdmin, setModalAdmin]     = useState(false);
  const [modalInicio, setModalInicio]   = useState(false);
  const [modalGenero, setModalGenero]   = useState(false);
  const [modalHorario, setModalHorario] = useState(false);
  const [horarioInput, setHorarioInput] = useState('20:30');

  // ── Animations ──────────────────────────────────────────────────────────────
  const fadeAmor = useRef(new Animated.Value(0)).current;
  const pulseBtn = useRef(new Animated.Value(1)).current;
  const [confete, setConfete] = useState(false);
  const tituloAnim = useRef(new Animated.Value(0)).current;

  // Abas (agora com 9)
  const ABAS = ['home', 'calendario', 'ranking', 'loja', 'conquistas', 'mural', 'conectar', 'sugestoes', 'perfil'];
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        const idx = ABAS.indexOf(abaAtiva);
        if (g.dx < -50 && idx < ABAS.length - 1) setAbaAtiva(ABAS[idx + 1]);
        if (g.dx > 50  && idx > 0)               setAbaAtiva(ABAS[idx - 1]);
      },
    })
  ).current;

  const hoje    = todayKey();
  const isAdmin = perfil?.isAdmin === true;
  const s       = makeStyles(tema);
  const listenersRef = useRef([]);

  // ────────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) { setAuthUser(user); await carregarPerfil(user.uid); }
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
      Animated.timing(pulseBtn, { toValue: 1,    duration: 800, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (casalId) {
      iniciarListeners(casalId);
      return () => pararListeners();
    }
  }, [casalId]);

  // ────────────────────────────────────────────────────────────────────────────
  // CORE FUNCTIONS
  // ────────────────────────────────────────────────────────────────────────────
  function resetEstado() {
    setHistorico({}); setPausa(null); setPontos({ ana: 0, harlley: 0 });
    setDataInicio(null); setFotos({}); setCasalId(null); setPerfil(null); setCasalConfig({});
    setAntrix(0); setIndPontos(0); setStreak(0);
    setItensComprados({ temas: [], selos: [], molduras: [] });
    setSeloEquipado(null); setMolduraEquipada(null);
    setTitulosDesbloqueados({}); setTituloEquipado(null);
    setConquistasDesbloqueadas({});
    setEstatisticas({
      rankPrimeiro: 0, rankPrimeiroConsecutivo: 0, antrixTotal: 0,
      totalTemasComprados: 0, totalTemasRarosComprados: 0, totalTemasLendariosComprados: 0,
      totalSelosComprados: 0, totalMoldurasCompradas: 0,
      tomadasHorarioPerfeito: 0, temasDiferentesUsados: new Set(),
      loginStreak: 0, diasSemErroHorario: 0, antrixSemGastar: 0
    });
  }

  async function carregarPerfil(uid) {
    try {
      const snap = await get(ref(db, `usuarios/${uid}`));
      if (!snap.exists()) { setTela('auth'); return; }
      const p = snap.val();
      setPerfil({ ...p, uid });
      setAntrix(p.antrix || 0);
      setIndPontos(p.indPontos || 0);
      setStreak(p.streak || 0);
      setItensComprados(p.itensComprados || { temas: [], selos: [], molduras: [] });
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
        setCasalId(p.casalId);
        setTela('app');
        const tSnap = await get(ref(db, `casais/${p.casalId}/tema`));
        if (tSnap.exists()) aplicarTema(tSnap.val());
        // Carregar mural
        carregarMural(p.casalId);
      } else {
        setTela('pair');
      }
    } catch(e) { setTela('auth'); }
  }

  async function carregarMural(cid) {
    const muralRef = ref(db, `casais/${cid}/mural`);
    const q = query(muralRef, orderByChild('timestamp'), limitToLast(50));
    onValue(q, (snap) => {
      const msgs = [];
      snap.forEach(child => {
        msgs.push({ id: child.key, ...child.val() });
      });
      const agora = Date.now();
      const filtradas = msgs.filter(m => (agora - m.timestamp) < 24 * 60 * 60 * 1000);
      setMensagensMural(filtradas.reverse());
    });
  }

  function iniciarListeners(cid) {
    try {
      const paths = ['historico', 'pausa', 'pontos', 'dataInicio', 'fotos', 'tema'];
      paths.forEach(p => {
        const r = ref(db, `casais/${cid}/${p}`);
        const unsub = onValue(r, snap => {
          const val = snap.val();
          if (p === 'historico')  setHistorico(val || {});
          if (p === 'pausa')      setPausa(val);
          if (p === 'pontos')     { if (val) setPontos(val); }
          if (p === 'dataInicio') { if (val) setDataInicio(val); }
          if (p === 'fotos')      { if (val) setFotos(val); }
          if (p === 'tema')       { if (val) aplicarTema(val); }
        });
        listenersRef.current.push({ r, unsub });
      });

      const cfgRef = ref(db, `casais/${cid}/config`);
      const cfgUnsub = onValue(cfgRef, snap => { if (snap.exists()) setCasalConfig(snap.val()); });
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

  function pararListeners() {
    listenersRef.current.forEach(({ r, unsub }) => {
      try { off(r); if (unsub) unsub(); } catch(e) {}
    });
    listenersRef.current = [];
  }

  function aplicarTema(idOuNome) {
    const id = typeof idOuNome === 'string' ? idOuNome : idOuNome?.id;
    if (!id) return;
    const temaEncontrado = getTemaById(id);
    if (temaEncontrado) {
      const newTheme = { ...TEMAS_BASE.roxo, primary: temaEncontrado.cor, bg: '#0a0010', card: '#130020', border: '#2a1040' };
      setTemaState(newTheme);
      setTemaAtualId(id);
      setEstatisticas(prev => {
        const novos = new Set(prev.temasDiferentesUsados);
        if (!novos.has(id)) novos.add(id);
        return { ...prev, temasDiferentesUsados: novos };
      });
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

  async function configurarAlarmes(cid) {
    try {
      if (!Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Notifications.cancelAllScheduledNotificationsAsync();

      const cfgSnap = await get(ref(db, `casais/${cid}/config/horarioPessoal/${authUser?.uid}`));
      const horarioPessoal = cfgSnap.exists() ? cfgSnap.val() : null;

      if (horarioPessoal) {
        const [hP, mP] = horarioPessoal.split(':').map(Number);
        await Notifications.scheduleNotificationAsync({
          identifier: 'lembrete_pessoal',
          content: { title: '💊 Seu horário!', body: `Hora de tomar a pílula (${horarioPessoal})`, sound: true },
          trigger: { hour: hP, minute: mP, repeats: true },
        });
      }

      await Notifications.scheduleNotificationAsync({
        identifier: 'janela_ouro',
        content: { title: 'Hora da pílula! 💊', body: 'Ana, não esqueça de tomar o Yazflex hoje', sound: true },
        trigger: { hour: JANELA_INICIO.h, minute: JANELA_INICIO.m, repeats: true },
      });

      await Notifications.scheduleNotificationAsync({
        identifier: 'modo_tensao',
        content: { title: '⚠️ Janela fechando!', body: 'Faltam 5 min para o fim da Janela de Ouro!', sound: true },
        trigger: { hour: JANELA_FIM.h, minute: JANELA_FIM.m - 5, repeats: true },
      });
    } catch(e) {}
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  async function fazerLogin() {
    setAuthLoading(true); setAuthErro('');
    try { await signInWithEmailAndPassword(auth, authEmail.trim(), authSenha); }
    catch(e) { setAuthErro('Erro no login. Verifique seus dados.'); }
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
      await set(ref(db, `usuarios/${cred.user.uid}`), {
        nome: authNome.trim(),
        email: authEmail.trim().toLowerCase(),
        isAdmin: isHarlley,
        casalId: null,
        genero: null,
        criadoEm: new Date().toISOString(),
        antrix: 0,
        indPontos: 0,
        streak: 0,
        itensComprados: { temas: [], selos: [], molduras: [] },
        seloEquipado: null,
        molduraEquipada: null,
        titulosDesbloqueados: {},
        tituloEquipado: null,
        conquistas: {},
        estatisticas: {
          rankPrimeiro: 0,
          rankPrimeiroConsecutivo: 0,
          antrixTotal: 0,
          totalTemasComprados: 0,
          totalTemasRarosComprados: 0,
          totalTemasLendariosComprados: 0,
          totalSelosComprados: 0,
          totalMoldurasCompradas: 0,
          tomadasHorarioPerfeito: 0,
          temasDiferentesUsados: [],
          loginStreak: 0,
          diasSemErroHorario: 0,
          antrixSemGastar: 0,
        }
      });
    } catch(e) { setAuthErro('Erro no cadastro.'); }
    setAuthLoading(false);
  }

  async function fazerLogout() {
    try { pararListeners(); await signOut(auth); } catch(e) {}
    resetEstado();
  }

  // ── Pair / Conectar ─────────────────────────────────────────────────────────
  async function criarCasal() {
    setPairLoading(true);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let chave = '';
      for (let i = 0; i < 6; i++) chave += chars[Math.floor(Math.random() * chars.length)];
      const id = `casal_${Date.now()}`;
      await set(ref(db, `casais/${id}`), {
        criadoEm: new Date().toISOString(), chave,
        membros: { [authUser.uid]: perfil.nome },
      });
      await set(ref(db, `pairCodes/${chave}`), { casalId: id });
      await set(ref(db, `usuarios/${authUser.uid}/casalId`), id);
      setPairChave(chave); setCasalId(id); setPairStep('mostrarChave');
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
        const { casalId: cid } = snap.val();
        await set(ref(db, `casais/${cid}/membros/${authUser.uid}`), perfil.nome);
        await set(ref(db, `usuarios/${authUser.uid}/casalId`), cid);
        await remove(ref(db, `pairCodes/${code}`));
        setCasalId(cid); setTela('app');
      } else { Alert.alert('Erro', 'Chave não encontrada.'); }
    } catch(e) { Alert.alert('Erro', 'Falha ao entrar na dupla.'); }
    setPairLoading(false);
  }

  async function gerarCodigoConvite() {
    if (!casalId) {
      Alert.alert('Erro', 'Você não está em uma dupla.');
      return;
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let chave = '';
    for (let i = 0; i < 6; i++) chave += chars[Math.floor(Math.random() * chars.length)];
    try {
      await set(ref(db, `pairCodes/${chave}`), { casalId });
      setCodigoGerado(chave);
      Alert.alert('Código gerado!', `Compartilhe com seu parceiro: ${chave}\nEle deve usar "Entrar com chave".`);
    } catch(e) {
      Alert.alert('Erro', 'Falha ao gerar código.');
    }
  }

  async function entrarComCodigo() {
    const code = pairInput.trim().toUpperCase();
    if (!code) return;
    await entrarCasal(); // reaproveita
  }

  // ── Gênero ──────────────────────────────────────────────────────────────────
  async function salvarGenero(genero) {
    try {
      await update(ref(db, `usuarios/${authUser.uid}`), { genero });
      setPerfil(p => ({ ...p, genero }));
      setModalGenero(false);
    } catch(e) { Alert.alert('Erro', 'Não foi possível salvar.'); }
  }

  // ── Horário Pessoal ──────────────────────────────────────────────────────────
  async function salvarHorarioPessoal() {
    const horario = horarioInput.trim();
    if (!/^\d{2}:\d{2}$/.test(horario)) {
      Alert.alert('Formato inválido', 'Use HH:MM — ex: 21:00'); return;
    }
    try {
      await update(ref(db, `casais/${casalId}/config/horarioPessoal`), { [authUser.uid]: horario });
      setCasalConfig(c => ({ ...c, horarioPessoal: { ...(c.horarioPessoal || {}), [authUser.uid]: horario } }));
      setModalHorario(false);
      await configurarAlarmes(casalId);
      Alert.alert('✅ Salvo', `Lembrete pessoal: ${horario}`);
    } catch(e) { Alert.alert('Erro', 'Falha ao salvar horário.'); }
  }

  // ── FUNÇÕES DE RECOMPENSA E CONQUISTAS ───────────────────────────────────────
  function calcularRecompensa(streakAtual) {
    let pontosGanhos = 10;
    let antrixGanho = 5;
    if (streakAtual >= 2) pontosGanhos = 15;
    if (streakAtual >= 3) pontosGanhos = 20;
    if (streakAtual >= 4) pontosGanhos = 30;
    if (streakAtual >= 5) pontosGanhos = 50;
    if (streakAtual >= 2) antrixGanho = 7;
    if (streakAtual >= 3) antrixGanho = 10;
    if (streakAtual >= 4) antrixGanho = 15;
    if (streakAtual >= 5) antrixGanho = 25;
    return { pontosGanhos, antrixGanho };
  }

  function calcularStreakAtual() {
    if (!dataInicio) return 0;
    let streakAtual = 0;
    let data = hoje;
    while (true) {
      if (historico[data]?.tomou) {
        streakAtual++;
        data = addDias(data, -1);
      } else {
        break;
      }
    }
    return streakAtual;
  }

  async function verificarTodasConquistas() {
    const dados = {
      streak,
      indPontos,
      antrix,
      rankPrimeiro: estatisticas.rankPrimeiro,
      rankPrimeiroConsecutivo: estatisticas.rankPrimeiroConsecutivo,
      antrixTotal: estatisticas.antrixTotal,
      totalTemasComprados: estatisticas.totalTemasComprados,
      totalTemasRarosComprados: estatisticas.totalTemasRarosComprados,
      totalTemasLendariosComprados: estatisticas.totalTemasLendariosComprados,
      totalSelosComprados: estatisticas.totalSelosComprados,
      totalMoldurasCompradas: estatisticas.totalMoldurasCompradas,
      tomadasHorarioPerfeito: estatisticas.tomadasHorarioPerfeito,
      temasDiferentesUsados: estatisticas.temasDiferentesUsados.size,
      loginStreak: estatisticas.loginStreak,
      diasSemErroHorario: estatisticas.diasSemErroHorario,
      antrixSemGastar: estatisticas.antrixSemGastar,
    };
    for (const categoria of Object.values(CONQUISTAS)) {
      for (const conquista of categoria) {
        const id = conquista.id;
        if (!conquistasDesbloqueadas[id] && conquista.cond(dados)) {
          setConquistasDesbloqueadas(prev => ({ ...prev, [id]: { desbloqueada: true, data: new Date().toISOString() } }));
          // Adicionar título se houver
          if (conquista.titulo || conquista.tituloSecreto) {
            const titulo = conquista.tituloSecreto || conquista.titulo;
            const cor = conquista.corTitulo || '#aaa';
            const animado = !!conquista.tituloSecreto;
            setTitulosDesbloqueados(prev => ({ ...prev, [id]: { titulo, cor, animado } }));
            await update(ref(db, `usuarios/${authUser.uid}/titulosDesbloqueados/${id}`), { titulo, cor, animado });
          }
          // Aplicar recompensa de Antrix
          if (conquista.recompensa.antrix) {
            const novoAntrix = antrix + conquista.recompensa.antrix;
            setAntrix(novoAntrix);
            await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
            setEstatisticas(prev => ({ ...prev, antrixTotal: prev.antrixTotal + conquista.recompensa.antrix }));
          }
          // Recompensa de tema e moldura
          if (conquista.recompensa.tema) {
            const temaObj = RECOMPENSAS_ESPECIAIS[conquista.recompensa.tema];
            if (temaObj && !itensComprados.temas.includes(temaObj.id)) {
              await comprarItem(temaObj.id, 0, 'temas', true);
            }
          }
          if (conquista.recompensa.moldura) {
            const molduraObj = RECOMPENSAS_ESPECIAIS[conquista.recompensa.moldura];
            if (molduraObj && !itensComprados.molduras.includes(molduraObj.id)) {
              await comprarItem(molduraObj.id, 0, 'molduras', true);
            }
          }
          await update(ref(db, `usuarios/${authUser.uid}/conquistas/${id}`), { desbloqueada: true, data: new Date().toISOString() });
          const nomeExibido = conquista.nomeRevelado || conquista.nome;
          Alert.alert('🏆 Conquista desbloqueada!', `${nomeExibido}`);
        }
      }
    }
  }

  // ── LOJA: comprar item ───────────────────────────────────────────────────────
  async function comprarItem(itemId, preco, tipo, gratuito = false) {
    if (!gratuito && antrix < preco) {
      Alert.alert('Antrix insuficiente', `Você tem ${antrix} Antrix. Preço: ${preco}`);
      return false;
    }
    if (itensComprados[tipo].includes(itemId)) {
      Alert.alert('Você já possui este item');
      return false;
    }
    if (!gratuito) {
      const novoAntrix = antrix - preco;
      setAntrix(novoAntrix);
      await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
      setEstatisticas(prev => ({ ...prev, antrixTotal: prev.antrixTotal + preco, antrixSemGastar: 0 }));
    }
    setItensComprados(prev => ({
      ...prev,
      [tipo]: [...prev[tipo], itemId]
    }));
    await update(ref(db, `usuarios/${authUser.uid}/itensComprados/${tipo}`), [...itensComprados[tipo], itemId]);
    if (tipo === 'temas') {
      setEstatisticas(prev => ({
        ...prev,
        totalTemasComprados: prev.totalTemasComprados + 1,
        totalTemasRarosComprados: prev.totalTemasRarosComprados + (isTemaRaro(itemId) ? 1 : 0),
        totalTemasLendariosComprados: prev.totalTemasLendariosComprados + (isTemaLendario(itemId) ? 1 : 0),
      }));
      await update(ref(db, `usuarios/${authUser.uid}/estatisticas`), {
        totalTemasComprados: estatisticas.totalTemasComprados + 1,
        totalTemasRarosComprados: estatisticas.totalTemasRarosComprados + (isTemaRaro(itemId) ? 1 : 0),
        totalTemasLendariosComprados: estatisticas.totalTemasLendariosComprados + (isTemaLendario(itemId) ? 1 : 0),
      });
    } else if (tipo === 'selos') {
      setEstatisticas(prev => ({ ...prev, totalSelosComprados: prev.totalSelosComprados + 1 }));
      await update(ref(db, `usuarios/${authUser.uid}/estatisticas`), { totalSelosComprados: estatisticas.totalSelosComprados + 1 });
    } else if (tipo === 'molduras') {
      setEstatisticas(prev => ({ ...prev, totalMoldurasCompradas: prev.totalMoldurasCompradas + 1 }));
      await update(ref(db, `usuarios/${authUser.uid}/estatisticas`), { totalMoldurasCompradas: estatisticas.totalMoldurasCompradas + 1 });
    }
    Alert.alert(gratuito ? 'Recompensa recebida!' : 'Compra realizada!', `${gratuito ? 'Item desbloqueado' : 'Item adquirido'}.`);
    await verificarTodasConquistas();
    return true;
  }

  function isTemaRaro(itemId) {
    return ITENS_LOJA.temas.raro.some(t => t.id === itemId);
  }
  function isTemaLendario(itemId) {
    return ITENS_LOJA.temas.lendario.some(t => t.id === itemId);
  }

  // ── ADMIN: Ferramentas de teste ───────────────────────────────────────────────
  async function adminSetAntrixInfinito() {
    const novoAntrix = 999999;
    setAntrix(novoAntrix);
    await update(ref(db, `usuarios/${authUser.uid}`), { antrix: novoAntrix });
    Alert.alert('Admin', 'Antrix definido para 999999');
  }

  async function adminDesbloquearTodasConquistas() {
    const todas = [];
    for (const cat of Object.values(CONQUISTAS)) {
      for (const c of cat) {
        todas.push(c.id);
      }
    }
    const newConquistas = {};
    for (const id of todas) {
      newConquistas[id] = { desbloqueada: true, data: new Date().toISOString() };
    }
    setConquistasDesbloqueadas(newConquistas);
    await set(ref(db, `usuarios/${authUser.uid}/conquistas`), newConquistas);
    Alert.alert('Admin', 'Todas as conquistas desbloqueadas!');
  }

  async function adminDesbloquearTodosItens() {
    const todosTemas = [
      ...ITENS_LOJA.temas.comum.map(t => t.id),
      ...ITENS_LOJA.temas.raro.map(t => t.id),
      ...ITENS_LOJA.temas.bonito.map(t => t.id),
      ...ITENS_LOJA.temas.lendario.map(t => t.id),
    ];
    const todosSelos = [
      ...ITENS_LOJA.selos.comum.map(s => s.id),
      ...ITENS_LOJA.selos.raro.map(s => s.id),
      ...ITENS_LOJA.selos.lendario.map(s => s.id),
    ];
    const todasMolduras = [
      ...ITENS_LOJA.molduras.comum.map(m => m.id),
      ...ITENS_LOJA.molduras.raro.map(m => m.id),
      ...ITENS_LOJA.molduras.lendario.map(m => m.id),
      ...Object.keys(RECOMPENSAS_ESPECIAIS).filter(k => k.startsWith('moldura_'))
    ];
    setItensComprados({ temas: todosTemas, selos: todosSelos, molduras: todasMolduras });
    await set(ref(db, `usuarios/${authUser.uid}/itensComprados`), { temas: todosTemas, selos: todosSelos, molduras: todasMolduras });
    Alert.alert('Admin', 'Todos os itens desbloqueados!');
  }

  async function adminDesbloquearTemasSecretos() {
    const secretos = Object.values(RECOMPENSAS_ESPECIAIS).filter(t => t.id.startsWith('tema_')).map(t => t.id);
    const novosTemas = [...itensComprados.temas, ...secretos];
    setItensComprados(prev => ({ ...prev, temas: novosTemas }));
    await set(ref(db, `usuarios/${authUser.uid}/itensComprados/temas`), novosTemas);
    Alert.alert('Admin', 'Temas secretos desbloqueados!');
  }

  async function adminResetarTudo() {
    Alert.alert(
      '⚠️ Reset Total',
      'Isso vai zerar todos os seus dados pessoais (Antrix, itens, conquistas, títulos, etc.). Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetar', style: 'destructive', onPress: async () => {
          await set(ref(db, `usuarios/${authUser.uid}`), {
            ...perfil,
            antrix: 0,
            indPontos: 0,
            streak: 0,
            itensComprados: { temas: [], selos: [], molduras: [] },
            seloEquipado: null,
            molduraEquipada: null,
            titulosDesbloqueados: {},
            tituloEquipado: null,
            conquistas: {},
            estatisticas: {
              rankPrimeiro: 0,
              rankPrimeiroConsecutivo: 0,
              antrixTotal: 0,
              totalTemasComprados: 0,
              totalTemasRarosComprados: 0,
              totalTemasLendariosComprados: 0,
              totalSelosComprados: 0,
              totalMoldurasCompradas: 0,
              tomadasHorarioPerfeito: 0,
              temasDiferentesUsados: [],
              loginStreak: 0,
              diasSemErroHorario: 0,
              antrixSemGastar: 0,
            }
          });
          resetEstado();
          Alert.alert('✅ Reset completo', 'Seus dados foram resetados.');
        }}
      ]
    );
  }

  async function adminLimparDiaHoje() {
    if (!casalId) return;
    try {
      if (historico[hoje]) {
        await remove(ref(db, `casais/${casalId}/historico/${hoje}`));
        Alert.alert('Admin', `Registro de ${hoje} removido.`);
      } else {
        Alert.alert('Admin', 'Nenhum registro hoje para remover.');
      }
    } catch(e) {
      Alert.alert('Erro', 'Falha ao remover.');
    }
  }

  // ── Função principal marcarTomou (completa) ───────────────────────────────────
  async function marcarTomou() {
    if (!casalId) return;
    if (pausa?.ativa) {
      Alert.alert('⏸️ Pausa ativa', 'Aguarde o fim da pausa.');
      return;
    }
    if (historico[hoje]?.tomou) {
      Alert.alert('Já tomou hoje', 'Você já registrou a pílula de hoje.');
      return;
    }

    try {
      const agora = new Date();
      const hora  = agora.toTimeString().slice(0, 5);
      const naJanela = estaDentroJanela('20:30', 10, agora);
      const quemSouEu = (perfil?.nome || '').toLowerCase().includes('harlley') ? 'harlley' : 'ana';

      const np = { ...pontos };
      if (naJanela) {
        np.ana = (np.ana || 0) + 1;
      } else {
        np[quemSouEu] = (np[quemSouEu] || 0) + 1;
      }
      await set(ref(db, `casais/${casalId}/pontos`), np);

      await set(ref(db, `casais/${casalId}/historico/${hoje}`), {
        data: hoje, hora, tomou: true, quemMarcou: authUser.uid,
      });

      const streakAtual = calcularStreakAtual();
      const { pontosGanhos, antrixGanho } = calcularRecompensa(streakAtual);
      const novoStreak = streakAtual + 1;
      const novoIndPontos = indPontos + pontosGanhos;
      const novoAntrix = antrix + antrixGanho;

      await update(ref(db, `usuarios/${authUser.uid}`), {
        indPontos: novoIndPontos,
        antrix: novoAntrix,
        streak: novoStreak
      });
      setIndPontos(novoIndPontos);
      setAntrix(novoAntrix);
      setStreak(novoStreak);
      setEstatisticas(prev => ({
        ...prev,
        antrixTotal: prev.antrixTotal + antrixGanho,
        antrixSemGastar: prev.antrixSemGastar + antrixGanho,
        tomadasHorarioPerfeito: prev.tomadasHorarioPerfeito + (naJanela ? 1 : 0),
        diasSemErroHorario: naJanela ? prev.diasSemErroHorario + 1 : 0
      }));

      await verificarTodasConquistas();

      const total = Object.keys(historico).length + 1;
      if (total % 28 === 0) { setConfete(true); setTimeout(() => setConfete(false), 3000); }

      setModalAmor(true);
      Animated.sequence([
        Animated.timing(fadeAmor, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(fadeAmor, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => setModalAmor(false));

      Alert.alert('✅ Tomou!', `+${pontosGanhos} pontos, +${antrixGanho} Antrix! Streak: ${novoStreak}`);
    } catch(e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao registrar.');
    }
  }

  async function adminToggleDia(key) {
    if (!isAdmin) return;
    try {
      if (historico[key]) await remove(ref(db, `casais/${casalId}/historico/${key}`));
      else await set(ref(db, `casais/${casalId}/historico/${key}`), { data: key, hora: '20:30', tomou: true });
    } catch(e) {}
  }

  async function definirDataInicio() {
    try {
      const ano = new Date().getFullYear();
      const dataStr = `${ano}-${String(pickerMes + 1).padStart(2, '0')}-${String(pickerDia).padStart(2, '0')}`;
      await set(ref(db, `casais/${casalId}/dataInicio`), dataStr);
      setModalInicio(false);
    } catch(e) {}
  }

  async function iniciarPausa() {
    try { await set(ref(db, `casais/${casalId}/pausa`), { inicio: hoje, fim: addDias(hoje, 4), ativa: true }); }
    catch(e) {}
  }

  async function despausar() {
    try { await set(ref(db, `casais/${casalId}/pausa/ativa`), false); } catch(e) {}
  }

  async function enviarSugestao() {
    if (!sugestao.trim()) return;
    try {
      await push(ref(db, `casais/${casalId}/sugestoes`), {
        texto: sugestao.trim(), data: new Date().toISOString(), usuario: perfil?.nome,
      });
      setSugestao(''); Alert.alert('Sucesso', 'Sugestão enviada!');
    } catch(e) {}
  }

  // ── MURAL DO AMOR ────────────────────────────────────────────────────────────
  async function enviarMensagem() {
    if (!novaMensagem.trim()) return;
    try {
      const msgRef = push(ref(db, `casais/${casalId}/mural`));
      await set(msgRef, {
        texto: novaMensagem.trim(),
        usuario: perfil?.nome,
        timestamp: Date.now(),
      });
      setNovaMensagem('');
    } catch(e) {
      Alert.alert('Erro', 'Falha ao enviar mensagem.');
    }
  }

  // ── RANKING GLOBAL ───────────────────────────────────────────────────────────
  async function carregarRankingGlobal() {
    setLoadingRanking(true);
    try {
      const snapshot = await get(ref(db, 'usuarios'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        let lista = [];
        for (let id in data) {
          lista.push({
            nome: data[id].nome,
            email: data[id].email,
            pontos: data[id].indPontos || 0,
            antrix: data[id].antrix || 0,
            streak: data[id].streak || 0,
          });
        }
        lista.sort((a, b) => b.pontos - a.pontos);
        setGlobalRanking(lista);
      } else {
        setGlobalRanking([]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar o ranking.');
    }
    setLoadingRanking(false);
    setModalRanking(true);
  }

  // ── SELO, MOLDURA, TÍTULO: equipar ───────────────────────────────────────────
  async function equiparSelo(seloId) {
    setSeloEquipado(seloId);
    await update(ref(db, `usuarios/${authUser.uid}`), { seloEquipado: seloId });
    setModalSelo(false);
    Alert.alert('Selo equipado!');
  }

  async function equiparMoldura(molduraId) {
    setMolduraEquipada(molduraId);
    await update(ref(db, `usuarios/${authUser.uid}`), { molduraEquipada: molduraId });
    setModalMoldura(false);
    Alert.alert('Moldura equipada!');
  }

  async function equiparTitulo(tituloId) {
    setTituloEquipado(tituloId);
    await update(ref(db, `usuarios/${authUser.uid}`), { tituloEquipado: tituloId });
    setModalTitulo(false);
    Alert.alert('Título equipado!');
  }

  // ── FOTO: galeria ───────────────────────────────────────────────────────────
  async function escolherFotoGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar sua galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      await set(ref(db, `casais/${casalId}/fotos/${authUser.uid}`), uri);
      setFotos(prev => ({ ...prev, [authUser.uid]: uri }));
      Alert.alert('Foto atualizada!');
    }
  }

  // ── OTA ─────────────────────────────────────────────────────────────────────
  async function baixarOta() {
    if (!otaInfo?.apkUrl) return;
    setOtaProgress(0.01);
    const destino = FileSystem.documentDirectory + 'pilula-ana-update.apk';
    try {
      const dl = FileSystem.createDownloadResumable(
        otaInfo.apkUrl, destino, {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          setOtaProgress(totalBytesWritten / totalBytesExpectedToWrite);
        }
      );
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
    } catch(e) {
      Alert.alert('Erro', 'Não foi possível baixar a atualização.');
      setOtaProgress(0);
    }
  }

  function ignorarOta() {
    versaoIgnoradaRef.current = otaInfo?.versao;
    setModalOta(false);
  }

  // ── Render Helpers ──────────────────────────────────────────────────────────
  const tomouHoje  = !!historico[hoje];
  const totalDias  = Object.keys(historico).length;
  const diaCartela = totalDias % 28 || (totalDias > 0 ? 28 : 0);
  const pD         = pausa?.ativa ? Math.ceil((new Date(pausa.fim + 'T23:59:59') - new Date()) / 86400000) : null;
  const fotoAtual  = fotos[authUser?.uid];
  const nomeAtual  = perfil?.nome || 'Usuário';
  const meuHorario = casalConfig?.horarioPessoal?.[authUser?.uid];
  const baixando   = otaProgress > 0 && otaProgress < 1;

  const getConquistaNome = (id) => {
    for (const cat of Object.values(CONQUISTAS)) {
      const c = cat.find(c => c.id === id);
      if (c) return c.nomeRevelado || c.nome;
    }
    return id;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  if (tela === 'splash') return (
    <View style={s.splash}>
      <Text style={s.splashEmoji}>💊</Text>
      <Text style={s.splashTitle}>Pílula da Ana - v{VERSAO_ATUAL}</Text>
      <ActivityIndicator color="#ff2d78" style={{ marginTop: 20 }} />
    </View>
  );

  if (tela === 'auth') return (
    <ScrollView contentContainerStyle={s.authWrap} keyboardShouldPersistTaps="handled">
      <Text style={s.splashEmoji}>💊</Text>
      <Text style={s.splashTitle}>Pílula da Ana - v{VERSAO_ATUAL}</Text>
      <Text style={s.authSub}>{authMode === 'login' ? 'Entrar na conta' : 'Criar conta'}</Text>
      {authMode === 'cadastro' && (
        <TextInput style={s.input} placeholder="Seu nome" placeholderTextColor="#555"
          value={authNome} onChangeText={setAuthNome} />
      )}
      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#555"
        value={authEmail} onChangeText={setAuthEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Senha" placeholderTextColor="#555"
        value={authSenha} onChangeText={setAuthSenha} secureTextEntry />
      {!!authErro && <Text style={s.erroTxt}>{authErro}</Text>}
      <TouchableOpacity style={s.btnPrimary} onPress={authMode === 'login' ? fazerLogin : fazerCadastro} disabled={authLoading}>
        {authLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnPrimaryTxt}>{authMode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setAuthMode(m => m === 'login' ? 'cadastro' : 'login')}>
        <Text style={s.authSwitch}>{authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (tela === 'pair') return (
    <ScrollView contentContainerStyle={s.authWrap}>
      <Text style={{ fontSize: 52, marginBottom: 16 }}>💕</Text>
      <Text style={s.splashTitle}>Conectar dupla</Text>
      <Text style={s.authSub}>Olá, {nomeAtual}! Conecte-se com seu par.</Text>
      {pairStep === 'menu' && <>
        <TouchableOpacity style={s.btnPrimary} onPress={criarCasal} disabled={pairLoading}>
          <Text style={s.btnPrimaryTxt}>✨ Criar nova dupla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => setPairStep('entrar')}>
          <Text style={s.btnSecondaryTxt}>🔑 Entrar com chave</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnSecondary, { marginTop: 8 }]} onPress={fazerLogout}>
          <Text style={s.btnSecondaryTxt}>🚪 Trocar de conta</Text>
        </TouchableOpacity>
      </>}
      {pairStep === 'mostrarChave' && <>
        <View style={s.chaveBox}>
          <Text style={s.chaveLabel}>Sua chave</Text>
          <Text style={s.chaveValor}>{pairChave}</Text>
        </View>
        <TouchableOpacity style={s.btnPrimary} onPress={() => setTela('app')}>
          <Text style={s.btnPrimaryTxt}>Continuar →</Text>
        </TouchableOpacity>
      </>}
      {pairStep === 'entrar' && <>
        <TextInput style={[s.input, s.inputChave]} placeholder="Chave" placeholderTextColor="#555"
          value={pairInput} onChangeText={t => setPairInput(t.toUpperCase())} maxLength={6} />
        <TouchableOpacity style={s.btnPrimary} onPress={entrarCasal} disabled={pairLoading}>
          <Text style={s.btnPrimaryTxt}>🔑 Entrar na dupla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => setPairStep('menu')}>
          <Text style={s.btnSecondaryTxt}>← Voltar</Text>
        </TouchableOpacity>
      </>}
    </ScrollView>
  );

  // ── TELA PRINCIPAL ──────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={false} />
      <Text style={{ position: 'absolute', top: 5, right: 10, color: '#aaa', fontSize: 10, zIndex: 100 }}>v{VERSAO_ATUAL}</Text>

      {/* Modais OTA, Amor, etc. (mantidos) */}
      <Modal transparent visible={modalOta} animationType="slide"
        onRequestClose={() => { if (!otaInfo?.forcarAtualizar) ignorarOta(); }}>
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🚀 v{otaInfo?.versao} disponível!</Text>
          <Text style={[s.authSub, { textAlign: 'left', marginBottom: 20 }]}>
            {otaInfo?.changelog || 'Novidades e melhorias!'}
          </Text>
          {baixando && (
            <View style={s.progressWrap}>
              <View style={[s.progressBar, { width: `${Math.round(otaProgress * 100)}%` }]} />
              <Text style={s.progressTxt}>{Math.round(otaProgress * 100)}%</Text>
            </View>
          )}
          <TouchableOpacity style={[s.btnPrimary, baixando && { opacity: 0.6 }]}
            onPress={baixarOta} disabled={baixando}>
            <Text style={s.btnPrimaryTxt}>
              {baixando ? `Baixando... ${Math.round(otaProgress * 100)}%` : '⬇️ Baixar agora'}
            </Text>
          </TouchableOpacity>
          {!otaInfo?.forcarAtualizar && (
            <TouchableOpacity style={s.btnSecondary} onPress={ignorarOta} disabled={baixando}>
              <Text style={s.btnSecondaryTxt}>Lembrar depois</Text>
            </TouchableOpacity>
          )}
        </View></View>
      </Modal>

      <Modal transparent visible={modalAmor} animationType="none">
        <Animated.View style={[s.modalAmor, { opacity: fadeAmor }]}>
          <Text style={{ fontSize: 80 }}>💕</Text>
          <Text style={s.modalAmorTxt}>Eu te amo amor</Text>
        </Animated.View>
      </Modal>

      <Modal transparent visible={modalTema} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🎨 Escolher tema</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {itensComprados.temas.map(temaId => {
              const temaItem = getTemaById(temaId);
              if (!temaItem) return null;
              return (
                <TouchableOpacity key={temaId} style={[s.temaBtn, temaAtualId === temaId && { borderColor: temaItem.cor }]}
                  onPress={() => salvarTema(temaId)}>
                  <View style={[s.temaCor, { backgroundColor: temaItem.cor }]} />
                  <Text style={s.temaTxt}>{temaItem.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalTema(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalAdmin} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>👑 Admin</Text>
          <TouchableOpacity style={s.adminBtn} onPress={() => { setModalAdmin(false); setModalInicio(true); }}>
            <Text style={s.adminBtnTxt}>📅 Definir início da cartela</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.adminBtn} onPress={() => { setModalAdmin(false); iniciarPausa(); }}>
            <Text style={s.adminBtnTxt}>⏸️ Iniciar Pausa (4 dias)</Text>
          </TouchableOpacity>
          {pausa?.ativa && (
            <TouchableOpacity style={s.adminBtn} onPress={() => { setModalAdmin(false); despausar(); }}>
              <Text style={s.adminBtnTxt}>▶️ Encerrar Pausa</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.adminBtn} onPress={adminLimparDiaHoje}>
            <Text style={s.adminBtnTxt}>🗑️ Remover registro de hoje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#ffaa00' }]} onPress={adminSetAntrixInfinito}>
            <Text style={[s.adminBtnTxt, { color: '#ffaa00' }]}>💰 Antrix infinito (999999)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#44ff44' }]} onPress={adminDesbloquearTodasConquistas}>
            <Text style={[s.adminBtnTxt, { color: '#44ff44' }]}>🏆 Desbloquear todas conquistas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#44ff44' }]} onPress={adminDesbloquearTodosItens}>
            <Text style={[s.adminBtnTxt, { color: '#44ff44' }]}>🎨 Desbloquear todos itens (temas+selos+molduras)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#ff66cc' }]} onPress={adminDesbloquearTemasSecretos}>
            <Text style={[s.adminBtnTxt, { color: '#ff66cc' }]}>✨ Desbloquear temas secretos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adminBtn, { borderColor: '#ff4444' }]} onPress={adminResetarTudo}>
            <Text style={[s.adminBtnTxt, { color: '#ff4444' }]}>⚠️ Reset total (apagar todos os dados)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalAdmin(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalInicio} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>📅 Início da cartela</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tema.sub, marginBottom: 8 }}>Mês</Text>
              <TouchableOpacity onPress={() => setPickerMes(m => (m + 1) % 12)}>
                <Text style={{ color: tema.primary, fontSize: 24 }}>▲</Text>
              </TouchableOpacity>
              <Text style={{ color: '#fff', fontSize: 18, marginVertical: 8 }}>{MESES[pickerMes].slice(0, 3)}</Text>
              <TouchableOpacity onPress={() => setPickerMes(m => (m - 1 + 12) % 12)}>
                <Text style={{ color: tema.primary, fontSize: 24 }}>▼</Text>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: tema.sub, marginBottom: 8 }}>Dia</Text>
              <TouchableOpacity onPress={() => setPickerDia(d => Math.min(d + 1, diasNoMes(pickerMes, new Date().getFullYear())))}>
                <Text style={{ color: tema.primary, fontSize: 24 }}>▲</Text>
              </TouchableOpacity>
              <Text style={{ color: '#fff', fontSize: 18, marginVertical: 8 }}>{pickerDia}</Text>
              <TouchableOpacity onPress={() => setPickerDia(d => Math.max(d - 1, 1))}>
                <Text style={{ color: tema.primary, fontSize: 24 }}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={definirDataInicio}>
            <Text style={s.btnPrimaryTxt}>✅ Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalInicio(false)}>
            <Text style={s.btnSecondaryTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalGenero} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>👤 Qual é o seu gênero?</Text>
          <Text style={[s.authSub, { textAlign: 'left', marginBottom: 20 }]}>
            Isso define como os pontos são calculados.
          </Text>
          <TouchableOpacity style={s.btnPrimary} onPress={() => salvarGenero('mulher')}>
            <Text style={s.btnPrimaryTxt}>👩 Mulher</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { backgroundColor: tema.accent, marginTop: 8 }]}
            onPress={() => salvarGenero('homem')}>
            <Text style={s.btnPrimaryTxt}>👨 Homem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => salvarGenero('nao_informado')}>
            <Text style={s.btnSecondaryTxt}>Prefiro não informar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalHorario} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>⏰ Horário pessoal</Text>
          <Text style={[s.authSub, { textAlign: 'left', marginBottom: 16 }]}>
            Lembrete configurável. A Janela de Ouro (20:30) permanece separada.
          </Text>
          <TextInput style={s.input} placeholder="HH:MM — ex: 21:00" placeholderTextColor="#555"
            value={horarioInput} onChangeText={setHorarioInput} keyboardType="numeric" maxLength={5} />
          <TouchableOpacity style={s.btnPrimary} onPress={salvarHorarioPessoal}>
            <Text style={s.btnPrimaryTxt}>✅ Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalHorario(false)}>
            <Text style={s.btnSecondaryTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalSelo} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>✨ Equipar selo</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {itensComprados.selos.map(seloId => {
              let seloItem = null;
              for (let cat of Object.values(ITENS_LOJA.selos)) {
                const found = cat.find(s => s.id === seloId);
                if (found) { seloItem = found; break; }
              }
              if (!seloItem) return null;
              return (
                <TouchableOpacity key={seloId} style={[s.temaBtn, seloEquipado === seloId && { borderColor: tema.primary }]}
                  onPress={() => equiparSelo(seloId)}>
                  <Text style={{ fontSize: 24, marginRight: 15 }}>{seloItem.emoji}</Text>
                  <Text style={s.temaTxt}>{seloItem.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalSelo(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalMoldura} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🖼️ Equipar moldura</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {itensComprados.molduras.map(molduraId => {
              const molduraItem = getMolduraById(molduraId);
              if (!molduraItem) return null;
              return (
                <TouchableOpacity key={molduraId} style={[s.temaBtn, molduraEquipada === molduraId && { borderColor: tema.primary }]}
                  onPress={() => equiparMoldura(molduraId)}>
                  <View style={[s.molduraCor, { backgroundColor: molduraItem.cor !== 'rainbow' ? molduraItem.cor : '#ffaa44', width: 20, height: 20, borderRadius: 10, marginRight: 15 }]} />
                  <Text style={s.temaTxt}>{molduraItem.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalMoldura(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalTitulo} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🏅 Escolher título</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {Object.entries(titulosDesbloqueados).map(([id, data]) => (
              <TouchableOpacity key={id} style={[s.temaBtn, tituloEquipado === id && { borderColor: tema.primary }]}
                onPress={() => equiparTitulo(id)}>
                <Text style={[s.tituloTexto, { color: data.cor }]}>{data.titulo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalTitulo(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={modalRanking} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🏆 Ranking Global</Text>
          {loadingRanking && <ActivityIndicator style={{ marginVertical: 20 }} />}
          <ScrollView style={{ maxHeight: 400 }}>
            {globalRanking.map((item, idx) => (
              <View key={idx} style={s.rankGlobalItem}>
                <Text style={s.rankPos}>{idx+1}º</Text>
                <Text style={s.rankName}>{item.nome || item.email.split('@')[0]}</Text>
                <Text style={s.rankValue}>{item.pontos} pts</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalRanking(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerLeft} onPress={() => setAbaAtiva('perfil')}>
          <View style={[s.avatarContainer, molduraEquipada && getMolduraById(molduraEquipada)?.animado && s.animada]}>
            {fotoAtual
              ? <Image source={{ uri: fotoAtual }} style={s.avatarHeader} />
              : <View style={s.avatarVazio}><Text>👤</Text></View>
            }
            {seloEquipado && (
              <View style={s.seloOverlay}>
                <Text style={s.seloEmoji}>{getSeloById(seloEquipado)?.emoji || '✨'}</Text>
              </View>
            )}
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={s.headerTitle}>{nomeAtual}</Text>
            {tituloEquipado && titulosDesbloqueados[tituloEquipado] && (
              <Animated.Text style={[s.tituloExibido, { color: titulosDesbloqueados[tituloEquipado].cor }, titulosDesbloqueados[tituloEquipado].animado && s.tituloAnimado]}>
                {titulosDesbloqueados[tituloEquipado].titulo}
              </Animated.Text>
            )}
            <Text style={s.headerSub}>{parceiro ? `💞 ${parceiro.nome}` : '💔 Sozinho'}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={s.iconBtn} onPress={() => setModalTema(true)}>
            <Text>🎨</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: tema.primary }]} onPress={() => setModalAdmin(true)}>
              <Text>👑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Abas (9) */}
      <View style={s.abas}>
        {ABAS.map((aba) => {
          const icones = { home:'🏠', calendario:'📅', ranking:'🏆', loja:'🛒', conquistas:'🏅', mural:'💌', conectar:'🔗', sugestoes:'💡', perfil:'👤' };
          return (
            <TouchableOpacity key={aba}
              style={[s.aba, abaAtiva === aba && { borderBottomWidth: 2, borderBottomColor: tema.primary }]}
              onPress={() => setAbaAtiva(aba)}>
              <Text style={[s.abaTxt, abaAtiva === aba && { opacity: 1 }]}>{icones[aba]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent} {...panResponder.panHandlers}>

        {/* HOME */}
        {abaAtiva === 'home' && <>
          {pD > 0 ? (
            <View style={[s.card, { borderColor: '#ffd60a' }]}>
              <Text style={{ fontSize: 44 }}>⏸️</Text>
              <Text style={[s.cardTitulo, { color: '#ffd60a' }]}>Pausa ativa</Text>
              <Text style={s.cardSub}>{pD} dias restantes</Text>
            </View>
          ) : <>
            <ConsistencyCircle historico={historico} dataInicio={dataInicio} tema={tema} />
            <View style={[s.card, { borderColor: tomouHoje ? '#00ff87' : tema.primary }]}>
              <Text style={{ fontSize: 48 }}>{tomouHoje ? '✅' : '⏰'}</Text>
              <Text style={s.cardTitulo}>{tomouHoje ? 'Tomou hoje!' : 'Ainda não tomou'}</Text>
              <Text style={s.cardSub}>Dia {diaCartela}/28</Text>
              {meuHorario && !tomouHoje && (
                <Text style={[s.cardSub, { marginTop: 6, color: tema.accent }]}>
                  ⏰ Seu lembrete: {meuHorario}
                </Text>
              )}
            </View>
            {!tomouHoje && (
              <Animated.View style={{ transform: [{ scale: pulseBtn }] }}>
                <TouchableOpacity style={s.btnPrimary} onPress={marcarTomou}>
                  <Text style={s.btnPrimaryTxt}>💊 Marcar agora</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </>}
        </>}

        {/* CALENDÁRIO */}
        {abaAtiva === 'calendario' && <>
          <View style={s.calHeader}>
            <TouchableOpacity onPress={() => {
              if (calMes === 0) { setCalMes(11); setCalAno(a => a - 1); } else setCalMes(m => m - 1);
            }}><Text style={s.calNav}>‹</Text></TouchableOpacity>
            <Text style={s.calTitulo}>{MESES[calMes]} {calAno}</Text>
            <TouchableOpacity onPress={() => {
              if (calMes === 11) { setCalMes(0); setCalAno(a => a + 1); } else setCalMes(m => m + 1);
            }}><Text style={s.calNav}>›</Text></TouchableOpacity>
          </View>
          <View style={s.calGrid}>
            {['D','S','T','Q','Q','S','S'].map((d, i) => (
              <View key={i} style={s.calDiaSemana}><Text style={s.calDiaSemanaT}>{d}</Text></View>
            ))}
            {(() => {
              const start = new Date(calAno, calMes, 1).getDay();
              const days  = diasNoMes(calMes, calAno);
              const cells = [];
              for (let i = 0; i < start; i++) cells.push(<View key={'e' + i} style={s.calCelVazia} />);
              for (let d = 1; d <= days; d++) {
                const key  = `${calAno}-${String(calMes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const tomou = !!historico[key];
                cells.push(
                  <TouchableOpacity key={key}
                    style={[s.calCel, tomou && { backgroundColor: tema.primary + '44' }]}
                    onPress={() => adminToggleDia(key)}>
                    <Text style={[s.calDiaNum, tomou && { color: tema.primary }]}>{d}</Text>
                  </TouchableOpacity>
                );
              }
              return cells;
            })()}
          </View>
        </>}

        {/* RANKING (dupla) */}
        {abaAtiva === 'ranking' && <>
          <Text style={s.secLabel}>🏆 Ranking da dupla</Text>
          <View style={[s.rankCard, { borderLeftWidth: 4, borderLeftColor: tema.primary }]}>
            <View>
              <Text style={s.rankNome}>Ana 👩</Text>
              <Text style={{ color: tema.sub, fontSize: 12 }}>Janela de Ouro (20:30–20:40)</Text>
            </View>
            <Text style={s.rankPts}>{pontos.ana || 0} pts</Text>
          </View>
          <View style={[s.rankCard, { borderLeftWidth: 4, borderLeftColor: tema.accent }]}>
            <View>
              <Text style={s.rankNome}>Harlley 👨</Text>
              <Text style={{ color: tema.sub, fontSize: 12 }}>Fora da janela / parceiro</Text>
            </View>
            <Text style={[s.rankPts, { color: tema.accent }]}>{pontos.harlley || 0} pts</Text>
          </View>
          <Text style={[s.authSub, { marginTop: 16, textAlign: 'left', color: tema.sub }]}>
            💡 Ana ganha pontos ao marcar dentro da Janela de Ouro.
            Fora da janela, quem marcou leva o ponto.
          </Text>
        </>}

        {/* LOJA */}
        {abaAtiva === 'loja' && <>
          <Text style={s.secLabel}>🛒 LOJA</Text>
          <Text style={s.statsInfo}>Seus Antrix: {antrix}</Text>
          {/* Temas Comuns */}
          <Text style={s.catTitulo}>🎨 Temas Comuns (20 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.temas.comum.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                <View style={[s.corTema, { backgroundColor: item.cor }]} />
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Temas Raros */}
          <Text style={s.catTitulo}>💎 Temas Raros (80 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.temas.raro.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                <View style={[s.corTema, { backgroundColor: item.cor }]} />
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Temas Bonitos */}
          <Text style={s.catTitulo}>✨ Temas Bonitos (200 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.temas.bonito.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                <View style={[s.corTema, { backgroundColor: item.cor }]} />
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Temas Lendários */}
          <Text style={s.catTitulo}>🏆 Temas Lendários (500 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.temas.lendario.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.temas.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'temas')} disabled={itensComprados.temas.includes(item.id)}>
                <View style={[s.corTema, { backgroundColor: item.cor }]} />
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Selos Comuns */}
          <Text style={s.catTitulo}>🟢 Selos Comuns (15 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.selos.comum.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.selos.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'selos')} disabled={itensComprados.selos.includes(item.id)}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>{item.emoji}</Text>
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Selos Raros */}
          <Text style={s.catTitulo}>🔵 Selos Raros (60 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.selos.raro.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.selos.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'selos')} disabled={itensComprados.selos.includes(item.id)}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>{item.emoji}</Text>
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Selos Lendários */}
          <Text style={s.catTitulo}>🟣 Selos Lendários (300 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.selos.lendario.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.selos.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'selos')} disabled={itensComprados.selos.includes(item.id)}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>{item.emoji}</Text>
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Molduras Comuns */}
          <Text style={s.catTitulo}>🖼️ Molduras Comuns (20 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.molduras.comum.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.molduras.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'molduras')} disabled={itensComprados.molduras.includes(item.id)}>
                <View style={[s.corTema, { backgroundColor: item.cor !== 'rainbow' ? item.cor : '#ffaa44' }]} />
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Molduras Raras */}
          <Text style={s.catTitulo}>✨ Molduras Raras (80 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.molduras.raro.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.molduras.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'molduras')} disabled={itensComprados.molduras.includes(item.id)}>
                <View style={[s.corTema, { backgroundColor: item.cor !== 'rainbow' ? item.cor : '#ffaa44' }]} />
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Molduras Lendárias */}
          <Text style={s.catTitulo}>🌟 Molduras Lendárias (300 Antrix)</Text>
          <View style={s.lojaGrid}>
            {ITENS_LOJA.molduras.lendario.map(item => (
              <TouchableOpacity key={item.id} style={[s.lojaItem, itensComprados.molduras.includes(item.id) && s.lojaItemOwned]}
                onPress={() => comprarItem(item.id, item.preco, 'molduras')} disabled={itensComprados.molduras.includes(item.id)}>
                <View style={[s.corTema, { backgroundColor: item.cor !== 'rainbow' ? item.cor : '#ffaa44' }]} />
                <Text style={s.lojaNome}>{item.nome}</Text>
                <Text style={s.lojaPreco}>{item.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>}

        {/* CONQUISTAS */}
        {abaAtiva === 'conquistas' && <>
          <Text style={s.secLabel}>🏅 CONQUISTAS</Text>
          {Object.entries(CONQUISTAS).map(([categoria, lista]) => (
            <View key={categoria}>
              <Text style={s.catConquista}>{categoria.toUpperCase()}</Text>
              {lista.map(conq => {
                const desbloq = conquistasDesbloqueadas[conq.id];
                const nome = desbloq ? (conq.nomeRevelado || conq.nome) : (conq.nomeSecreto || '???');
                return (
                  <View key={conq.id} style={s.conquistaItem}>
                    <Text style={[s.conquistaNome, desbloq && s.conquistaDesbloq]}>{nome}</Text>
                    {desbloq && <Text style={s.conquistaCheck}>✅</Text>}
                  </View>
                );
              })}
            </View>
          ))}
        </>}

        {/* MURAL DO AMOR */}
        {abaAtiva === 'mural' && <>
          <Text style={s.secLabel}>💌 Mural do Amor</Text>
          <FlatList
            data={mensagensMural}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={s.mensagemItem}>
                <Text style={s.mensagemUsuario}>{item.usuario}</Text>
                <Text style={s.mensagemTexto}>{item.texto}</Text>
                <Text style={s.mensagemData}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={s.authSub}>Nenhuma mensagem nas últimas 24h. Deixe um recado!</Text>}
          />
          <TextInput
            style={[s.input, { marginTop: 10 }]}
            placeholder="Escreva uma mensagem de amor..."
            placeholderTextColor="#555"
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            multiline
          />
          <TouchableOpacity style={s.btnPrimary} onPress={enviarMensagem}>
            <Text style={s.btnPrimaryTxt}>💌 Enviar mensagem</Text>
          </TouchableOpacity>
        </>}

        {/* CONECTAR (Pareamento) */}
        {abaAtiva === 'conectar' && <>
          <Text style={s.secLabel}>🔗 Conectar com parceiro(a)</Text>
          <Text style={s.authSub}>Gerar código ou inserir código recebido</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={gerarCodigoConvite}>
            <Text style={s.btnPrimaryTxt}>✨ Gerar código de convite</Text>
          </TouchableOpacity>
          {codigoGerado !== '' && (
            <View style={s.chaveBox}>
              <Text style={s.chaveLabel}>Seu código:</Text>
              <Text style={s.chaveValor}>{codigoGerado}</Text>
            </View>
          )}
          <Text style={s.authSub}>ou</Text>
          <TextInput
            style={[s.input, s.inputChave]}
            placeholder="Código de 6 dígitos"
            placeholderTextColor="#555"
            value={pairInput}
            onChangeText={t => setPairInput(t.toUpperCase())}
            maxLength={6}
          />
          <TouchableOpacity style={s.btnPrimary} onPress={entrarComCodigo} disabled={pairLoading}>
            <Text style={s.btnPrimaryTxt}>🔑 Entrar com código</Text>
          </TouchableOpacity>
        </>}

        {/* SUGESTÕES */}
        {abaAtiva === 'sugestoes' && <>
          <Text style={s.secLabel}>💡 Sugestões</Text>
          <TextInput
            style={[s.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Escreva uma sugestão..."
            placeholderTextColor="#555"
            value={sugestao}
            onChangeText={setSugestao}
            multiline
          />
          <TouchableOpacity style={s.btnPrimary} onPress={enviarSugestao}>
            <Text style={s.btnPrimaryTxt}>📤 Enviar</Text>
          </TouchableOpacity>
        </>}

        {/* PERFIL */}
        {abaAtiva === 'perfil' && <>
          <View style={s.perfilCard}>
            <TouchableOpacity onPress={escolherFotoGaleria}>
              <View style={[s.avatarContainerPerfil, molduraEquipada && getMolduraById(molduraEquipada)?.animado && s.animada]}>
                {fotoAtual
                  ? <Image source={{ uri: fotoAtual }} style={s.fotoPerfil} />
                  : <View style={s.fotoPerfilVazio}><Text style={{ fontSize: 40 }}>📷</Text></View>
                }
                {seloEquipado && (
                  <View style={s.seloOverlayPerfil}>
                    <Text style={s.seloEmojiPerfil}>{getSeloById(seloEquipado)?.emoji || '✨'}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <Text style={s.perfilNome}>{nomeAtual}</Text>
            {tituloEquipado && titulosDesbloqueados[tituloEquipado] && (
              <Animated.Text style={[s.tituloExibidoPerfil, { color: titulosDesbloqueados[tituloEquipado].cor }, titulosDesbloqueados[tituloEquipado].animado && s.tituloAnimado]}>
                {titulosDesbloqueados[tituloEquipado].titulo}
              </Animated.Text>
            )}
            {perfil?.genero && (
              <Text style={{ color: tema.sub, fontSize: 13, marginTop: 4 }}>
                {perfil.genero === 'mulher' ? '👩 Mulher' : perfil.genero === 'homem' ? '👨 Homem' : '⚪ Não informado'}
              </Text>
            )}
            {/* Estatísticas */}
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statValue}>{indPontos}</Text>
                <Text style={s.statLabel}>Pontos</Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statValue}>{antrix}</Text>
                <Text style={s.statLabel}>Antrix</Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statValue}>{streak}</Text>
                <Text style={s.statLabel}>Streak</Text>
              </View>
            </View>
            {/* Botões de equipar */}
            <TouchableOpacity style={[s.adminBtn, { width: '100%', marginTop: 8 }]} onPress={() => setModalSelo(true)}>
              <Text style={s.adminBtnTxt}>✨ Escolher selo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.adminBtn, { width: '100%', marginTop: 8 }]} onPress={() => setModalMoldura(true)}>
              <Text style={s.adminBtnTxt}>🖼️ Escolher moldura</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.adminBtn, { width: '100%', marginTop: 8 }]} onPress={() => setModalTitulo(true)}>
              <Text style={s.adminBtnTxt}>🏅 Escolher título</Text>
            </TouchableOpacity>
            {/* Configurações */}
            <TouchableOpacity style={[s.adminBtn, { width: '100%', marginTop: 12 }]} onPress={() => {
              setHorarioInput(meuHorario || '20:30');
              setModalHorario(true);
            }}>
              <Text style={s.adminBtnTxt}>
                ⏰ {meuHorario ? `Lembrete pessoal: ${meuHorario}` : 'Definir horário pessoal'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.adminBtn, { width: '100%', marginTop: 8 }]}
              onPress={() => setModalGenero(true)}>
              <Text style={s.adminBtnTxt}>👤 Alterar gênero</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.adminBtn, { width: '100%', marginTop: 8, borderColor: '#44ff44' }]}
              onPress={carregarRankingGlobal}>
              <Text style={[s.adminBtnTxt, { color: '#44ff44' }]}>🏆 Ver Ranking Global</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btnSecondary, { marginTop: 8 }]} onPress={fazerLogout}>
              <Text style={{ color: '#ff4444', fontWeight: '700' }}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </>}

      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES (completos)
// ══════════════════════════════════════════════════════════════════════════════
const makeStyles = (tema) => StyleSheet.create({
  root:           { flex: 1, backgroundColor: tema.bg },
  splash:         { flex: 1, backgroundColor: '#0a0010', alignItems: 'center', justifyContent: 'center' },
  splashEmoji:    { fontSize: 64, marginBottom: 16 },
  splashTitle:    { fontSize: 28, fontWeight: '800', color: '#fff' },
  authWrap:       { flexGrow: 1, backgroundColor: '#0a0010', padding: 28, justifyContent: 'center' },
  authSub:        { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 28 },
  authSwitch:     { color: '#7b2fff', textAlign: 'center', marginTop: 16 },
  input:          { backgroundColor: tema.card, borderRadius: 12, padding: 16, color: tema.text, marginBottom: 12, borderWidth: 1, borderColor: tema.border },
  inputChave:     { textAlign: 'center', fontSize: 24, fontWeight: '800', letterSpacing: 6 },
  btnPrimary:     { backgroundColor: tema.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12 },
  btnPrimaryTxt:  { color: '#fff', fontWeight: '800' },
  btnSecondary:   { padding: 12, alignItems: 'center', marginTop: 8 },
  btnSecondaryTxt:{ color: tema.sub },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: tema.card },
  headerLeft:     { flexDirection: 'row', alignItems: 'center' },
  headerTitle:    { color: '#fff', fontWeight: '800', fontSize: 18 },
  headerSub:      { color: tema.sub, fontSize: 12 },
  avatarContainer: { position: 'relative', width: 40, height: 40 },
  avatarHeader:   { width: 40, height: 40, borderRadius: 20 },
  avatarVazio:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  seloOverlay:    { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#000000aa', borderRadius: 12, padding: 2 },
  seloEmoji:      { fontSize: 14 },
  avatarContainerPerfil: { position: 'relative', width: 100, height: 100, borderRadius: 50 },
  fotoPerfil:     { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: tema.primary },
  fotoPerfilVazio:{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  seloOverlayPerfil: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000000aa', borderRadius: 20, padding: 4 },
  seloEmojiPerfil: { fontSize: 20 },
  tituloExibido:  { fontSize: 10, color: '#aaa', marginTop: 2 },
  tituloExibidoPerfil: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  tituloAnimado:  { textShadowColor: '#ffaa44', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  iconBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  abas:           { flexDirection: 'row', backgroundColor: tema.card, borderBottomWidth: 1, borderBottomColor: tema.border },
  aba:            { flex: 1, padding: 12, alignItems: 'center' },
  abaTxt:         { fontSize: 20, opacity: 0.4 },
  body:           { flex: 1 },
  bodyContent:    { padding: 20 },
  card:           { backgroundColor: tema.card, borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 2, marginBottom: 20 },
  cardTitulo:     { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 10 },
  cardSub:        { color: tema.sub, marginTop: 5 },
  secLabel:       { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  calHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calTitulo:      { color: '#fff', fontSize: 18, fontWeight: '800' },
  calNav:         { color: tema.primary, fontSize: 30, paddingHorizontal: 20 },
  calGrid:        { flexDirection: 'row', flexWrap: 'wrap' },
  calDiaSemana:   { width: (SW - 40) / 7, alignItems: 'center', marginBottom: 10 },
  calDiaSemanaT:  { color: tema.sub, fontSize: 12 },
  calCel:         { width: (SW - 40) / 7, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  calCelVazia:    { width: (SW - 40) / 7, height: 45 },
  calDiaNum:      { color: '#fff', fontSize: 14 },
  rankCard:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: tema.card, padding: 20, borderRadius: 16, marginBottom: 10 },
  rankNome:       { color: '#fff', fontWeight: '700' },
  rankPts:        { color: tema.primary, fontWeight: '800', fontSize: 20 },
  perfilCard:     { alignItems: 'center', padding: 30, backgroundColor: tema.card, borderRadius: 24 },
  perfilNome:     { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 15 },
  perfilVersao:   { color: tema.sub, fontSize: 12, marginTop: 5, marginBottom: 8 },
  modalWrap:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard:      { backgroundColor: tema.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: tema.border },
  modalTitulo:    { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  modalAmor:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  modalAmorTxt:   { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 20 },
  temaBtn:        { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: tema.border, marginBottom: 10 },
  temaCor:        { width: 20, height: 20, borderRadius: 10, marginRight: 15 },
  temaTxt:        { color: '#fff', fontWeight: '600' },
  adminBtn:       { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: tema.primary, marginBottom: 10 },
  adminBtnTxt:    { color: tema.primary, textAlign: 'center', fontWeight: '700' },
  chaveBox:       { backgroundColor: tema.card, borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: tema.primary },
  chaveLabel:     { color: tema.sub, fontSize: 14, marginBottom: 8 },
  chaveValor:     { color: tema.primary, fontSize: 36, fontWeight: '900', letterSpacing: 8 },
  erroTxt:        { color: '#ff4444', textAlign: 'center', marginBottom: 10 },
  progressWrap:   { width: '100%', height: 8, backgroundColor: tema.border, borderRadius: 4, marginBottom: 16, overflow: 'hidden' },
  progressBar:    { height: '100%', backgroundColor: tema.primary, borderRadius: 4 },
  progressTxt:    { color: tema.sub, fontSize: 12, textAlign: 'center', marginTop: 4 },

  statsRow:       { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 15 },
  statItem:       { alignItems: 'center' },
  statValue:      { fontSize: 24, fontWeight: 'bold', color: tema.primary },
  statLabel:      { fontSize: 12, color: tema.sub, marginTop: 4 },
  conquistaItem:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tema.border },
  conquistaNome:  { color: tema.sub, fontSize: 12, flex: 1 },
  conquistaDesbloq:{ color: '#fff', fontWeight: 'bold' },
  conquistaCheck:  { color: '#00ff87', fontSize: 16, marginLeft: 8 },
  rankGlobalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tema.border },
  rankPos:        { width: 40, fontSize: 16, fontWeight: 'bold', color: tema.primary },
  rankName:       { flex: 1, fontSize: 14, color: '#fff' },
  rankValue:      { fontSize: 14, fontWeight: 'bold', color: tema.primary },
  statsInfo:      { color: tema.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  catTitulo:      { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  lojaGrid:       { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  lojaItem:       { width: (SW - 60) / 2, backgroundColor: tema.card, borderRadius: 12, padding: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: tema.border },
  lojaItemOwned:  { opacity: 0.5 },
  corTema:        { width: 40, height: 40, borderRadius: 20, marginBottom: 8 },
  lojaNome:       { color: '#fff', fontSize: 12, textAlign: 'center' },
  lojaPreco:      { color: tema.primary, fontSize: 10, marginTop: 4 },
  catConquista:   { color: tema.primary, fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  mensagemItem:   { backgroundColor: tema.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: tema.border },
  mensagemUsuario:{ color: tema.primary, fontWeight: 'bold', fontSize: 12 },
  mensagemTexto:  { color: '#fff', fontSize: 14, marginTop: 4 },
  mensagemData:   { color: tema.sub, fontSize: 10, marginTop: 4, textAlign: 'right' },
  animada:        { borderWidth: 2, borderColor: '#ffaa44', shadowColor: '#ffaa44', shadowOffset: { width: 0, height: 0 }, shadowRadius: 5, shadowOpacity: 0.8 },
  tituloTexto:    { fontSize: 16, fontWeight: 'bold' },
  molduraCor:     { width: 20, height: 20, borderRadius: 10, marginRight: 15 },
});

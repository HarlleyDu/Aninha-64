import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, Modal, Animated, Image,
  ActivityIndicator, Dimensions, PanResponder, StatusBar
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { initializeApp } from 'firebase/app';
import {
  getDatabase, ref, set, get, onValue, push, remove, off, update
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
const VERSAO_ATUAL  = "5.1.0";
const ADMIN_EMAIL   = "Harlleyduarte@gmail.com";
const JANELA_INICIO = { h: 20, m: 30 };
const JANELA_FIM    = { h: 20, m: 40 };
const { width: SW } = Dimensions.get('window');

// ─── Themes ────────────────────────────────────────────────────────────────────
const TEMAS = {
  roxo:   { primary:'#ff2d78', bg:'#0a0010', card:'#130020', border:'#2a1040', accent:'#7b2fff', text:'#fff', sub:'#aa88cc' },
  dourado:{ primary:'#ffd60a', bg:'#0a0800', card:'#1a1200', border:'#3a2a00', accent:'#ff9500', text:'#fff', sub:'#ccaa44' },
  ciano:  { primary:'#00e5ff', bg:'#000a10', card:'#001520', border:'#003040', accent:'#0088cc', text:'#fff', sub:'#44aacc' },
  verde:  { primary:'#00ff87', bg:'#000a05', card:'#001510', border:'#003020', accent:'#00cc66', text:'#fff', sub:'#44cc88' },
};

// ─── Date Helpers ──────────────────────────────────────────────────────────────
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

// ─── Game Logic Helpers ────────────────────────────────────────────────────────
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

// ─── Notification Handler ──────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// ══════════════════════════════════════════════════════════════════════════════
// CONSISTENCY CIRCLE
// Cartela de 28 dias em formato circular. Sem dependências externas.
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

  // ── Pair ────────────────────────────────────────────────────────────────────
  const [pairStep, setPairStep]       = useState('menu');
  const [pairChave, setPairChave]     = useState('');
  const [pairInput, setPairInput]     = useState('');
  const [pairLoading, setPairLoading] = useState(false);

  // ── App data ────────────────────────────────────────────────────────────────
  const [historico, setHistorico]     = useState({});
  const [pausa, setPausa]             = useState(null);
  const [pontos, setPontos]           = useState({ ana: 0, harlley: 0 });
  const [dataInicio, setDataInicio]   = useState(null);
  const [fotos, setFotos]             = useState({});
  const [tema, setTemaState]          = useState(TEMAS.roxo);
  const [temaNome, setTemaNome]       = useState('roxo');
  const [sugestao, setSugestao]       = useState('');
  const [abaAtiva, setAbaAtiva]       = useState('home');
  const [adminUsers, setAdminUsers]   = useState([]);
  const [casalConfig, setCasalConfig] = useState({});

  // ── OTA ─────────────────────────────────────────────────────────────────────
  // versaoIgnoradaRef: substitui AsyncStorage. Reseta ao fechar o app.
  // Se forcarAtualizar=true no Firebase, o botão "depois" desaparece.
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
  const [modalFotoUrl, setModalFotoUrl] = useState(false);
  const [urlFotoTemp, setUrlFotoTemp]   = useState('');
  const [modalGenero, setModalGenero]   = useState(false);
  const [modalHorario, setModalHorario] = useState(false);
  const [horarioInput, setHorarioInput] = useState('20:30');

  // ── Animations ──────────────────────────────────────────────────────────────
  const fadeAmor = useRef(new Animated.Value(0)).current;
  const pulseBtn = useRef(new Animated.Value(1)).current;
  const [confete, setConfete] = useState(false);

  const ABAS = ['home', 'calendario', 'ranking', 'sugestoes', 'perfil'];
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

  // ══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) { setAuthUser(user); await carregarPerfil(user.uid); }
        else { resetEstado(); setTela('auth'); }
      } catch(e) { setTela('auth'); }
    });
    return () => unsub();
  }, []);

  // OTA: escuta /config no Firebase em tempo real
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

  // ══════════════════════════════════════════════════════════════════════════
  // CORE FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  function resetEstado() {
    setHistorico({}); setPausa(null); setPontos({ ana: 0, harlley: 0 });
    setDataInicio(null); setFotos({}); setCasalId(null); setPerfil(null); setCasalConfig({});
  }

  async function carregarPerfil(uid) {
    try {
      const snap = await get(ref(db, `usuarios/${uid}`));
      if (!snap.exists()) { setTela('auth'); return; }
      const p = snap.val();
      setPerfil({ ...p, uid });
      if (!p.genero) setModalGenero(true); // onboarding
      if (p.casalId) {
        setCasalId(p.casalId);
        setTela('app');
        const tSnap = await get(ref(db, `casais/${p.casalId}/tema`));
        if (tSnap.exists()) aplicarTema(tSnap.val());
      } else {
        setTela('pair');
      }
    } catch(e) { setTela('auth'); }
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

  function aplicarTema(t) {
    const nome = typeof t === 'string' ? t : t?.nome;
    if (nome && TEMAS[nome]) { setTemaNome(nome); setTemaState(TEMAS[nome]); }
  }

  async function salvarTema(nome) {
    try { await set(ref(db, `casais/${casalId}/tema`), nome); setModalTema(false); }
    catch(e) { Alert.alert('Erro', 'Não foi possível salvar o tema.'); }
  }

  // Notificações: usa horário pessoal do usuário se definido,
  // mais Janela de Ouro fixa e alerta de tensão 5min antes do fim.
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
      });
    } catch(e) { setAuthErro('Erro no cadastro.'); }
    setAuthLoading(false);
  }

  async function fazerLogout() {
    try { pararListeners(); await signOut(auth); } catch(e) {}
    resetEstado();
  }

  // ── Pair ────────────────────────────────────────────────────────────────────
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

  // ── Pontuação por gênero ─────────────────────────────────────────────────────
  // Estrutura no Firebase permanece { ana: N, harlley: N } — sem quebrar dados.
  // Dentro da Janela de Ouro → sempre +1 ana (quem tomou a pílula).
  // Fora da janela → +1 para quem marcou (ana ou harlley).
  async function marcarTomou() {
    if (!casalId) return;
    try {
      const agora = new Date();
      const hora  = agora.toTimeString().slice(0, 5);
      const naJanela = estaDentroJanela('20:30', 10, agora);
      const quemSouEu = (perfil?.nome || '').toLowerCase().includes('harlley') ? 'harlley' : 'ana';

      await set(ref(db, `casais/${casalId}/historico/${hoje}`), {
        data: hoje, hora, tomou: true, quemMarcou: authUser.uid,
      });

      const np = { ...pontos };
      if (naJanela) {
        np.ana = (np.ana || 0) + 1;
      } else {
        np[quemSouEu] = (np[quemSouEu] || 0) + 1;
      }
      await set(ref(db, `casais/${casalId}/pontos`), np);

      const total = Object.keys(historico).length + 1;
      if (total % 28 === 0) { setConfete(true); setTimeout(() => setConfete(false), 3000); }

      setModalAmor(true);
      Animated.sequence([
        Animated.timing(fadeAmor, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(fadeAmor, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => setModalAmor(false));
    } catch(e) { Alert.alert('Erro', 'Falha ao registrar.'); }
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

  async function escolherFoto() { setModalFotoUrl(true); }

  async function salvarFotoUrl() {
    if (!urlFotoTemp.trim()) return;
    try {
      await set(ref(db, `casais/${casalId}/fotos/${authUser.uid}`), urlFotoTemp.trim());
      setUrlFotoTemp(''); setModalFotoUrl(false);
    } catch(e) {}
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
    versaoIgnoradaRef.current = otaInfo?.versao; // memória, sem AsyncStorage
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

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  if (tela === 'splash') return (
    <View style={s.splash}>
      <Text style={s.splashEmoji}>💊</Text>
      <Text style={s.splashTitle}>Pílula da Ana</Text>
      <ActivityIndicator color="#ff2d78" style={{ marginTop: 20 }} />
    </View>
  );

  if (tela === 'auth') return (
    <ScrollView contentContainerStyle={s.authWrap} keyboardShouldPersistTaps="handled">
      <Text style={s.splashEmoji}>💊</Text>
      <Text style={s.splashTitle}>Pílula da Ana</Text>
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

      {/* Modal OTA */}
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

      {/* Modal Amor */}
      <Modal transparent visible={modalAmor} animationType="none">
        <Animated.View style={[s.modalAmor, { opacity: fadeAmor }]}>
          <Text style={{ fontSize: 80 }}>💕</Text>
          <Text style={s.modalAmorTxt}>Eu te amo amor</Text>
        </Animated.View>
      </Modal>

      {/* Modal Foto */}
      <Modal transparent visible={modalFotoUrl} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>📷 URL da foto</Text>
          <TextInput style={s.input} placeholder="https://..." placeholderTextColor="#555"
            value={urlFotoTemp} onChangeText={setUrlFotoTemp} />
          <TouchableOpacity style={s.btnPrimary} onPress={salvarFotoUrl}>
            <Text style={s.btnPrimaryTxt}>✅ Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalFotoUrl(false)}>
            <Text style={s.btnSecondaryTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Tema */}
      <Modal transparent visible={modalTema} animationType="slide">
        <View style={s.modalWrap}><View style={s.modalCard}>
          <Text style={s.modalTitulo}>🎨 Tema</Text>
          {Object.entries(TEMAS).map(([nome, t]) => (
            <TouchableOpacity key={nome} style={[s.temaBtn, temaNome === nome && { borderColor: t.primary }]}
              onPress={() => salvarTema(nome)}>
              <View style={[s.temaCor, { backgroundColor: t.primary }]} />
              <Text style={s.temaTxt}>{nome}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalTema(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Admin */}
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
          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalAdmin(false)}>
            <Text style={s.btnSecondaryTxt}>Fechar</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

      {/* Modal Início da Cartela */}
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

      {/* Modal Gênero (onboarding) */}
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

      {/* Modal Horário Pessoal */}
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

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerLeft} onPress={() => setAbaAtiva('perfil')}>
          {fotoAtual
            ? <Image source={{ uri: fotoAtual }} style={s.avatarHeader} />
            : <View style={s.avatarVazio}><Text>👤</Text></View>
          }
          <View style={{ marginLeft: 10 }}>
            <Text style={s.headerTitle}>{nomeAtual}</Text>
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

      {/* Abas */}
      <View style={s.abas}>
        {[['home','🏠'],['calendario','📅'],['ranking','🏆'],['sugestoes','💡'],['perfil','👤']].map(([aba, ic]) => (
          <TouchableOpacity key={aba}
            style={[s.aba, abaAtiva === aba && { borderBottomWidth: 2, borderBottomColor: tema.primary }]}
            onPress={() => setAbaAtiva(aba)}>
            <Text style={[s.abaTxt, abaAtiva === aba && { opacity: 1 }]}>{ic}</Text>
          </TouchableOpacity>
        ))}
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

        {/* RANKING */}
        {abaAtiva === 'ranking' && <>
          <Text style={s.secLabel}>🏆 Ranking</Text>
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
            <TouchableOpacity onPress={escolherFoto}>
              {fotoAtual
                ? <Image source={{ uri: fotoAtual }} style={s.fotoPerfil} />
                : <View style={s.fotoPerfilVazio}><Text style={{ fontSize: 40 }}>📷</Text></View>
              }
            </TouchableOpacity>
            <Text style={s.perfilNome}>{nomeAtual}</Text>
            {perfil?.genero && (
              <Text style={{ color: tema.sub, fontSize: 13, marginTop: 4 }}>
                {perfil.genero === 'mulher' ? '👩 Mulher' : perfil.genero === 'homem' ? '👨 Homem' : '⚪ Não informado'}
              </Text>
            )}
            <Text style={s.perfilVersao}>v{VERSAO_ATUAL}</Text>
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
// STYLES
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
  avatarHeader:   { width: 40, height: 40, borderRadius: 20 },
  avatarVazio:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  iconBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  abas:           { flexDirection: 'row', backgroundColor: tema.card, borderBottomWidth: 1, borderBottomColor: tema.border },
  aba:            { flex: 1, padding: 15, alignItems: 'center' },
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
  fotoPerfil:     { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: tema.primary },
  fotoPerfilVazio:{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
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
});

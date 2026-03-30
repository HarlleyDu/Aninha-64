/**
 * ANINHA 64 - App.js v1.1.2
 *
 * Fixes v1.1.2 (em cima do App_v1_1_1 que você mandou):
 * 1. Chaves reais do Firebase restauradas (estavam como YOUR_API_KEY)
 * 2. Permissão de galeria adicionada antes do picker
 * 3. Botão "Marcar" sempre habilitado (fora da janela = ponto de quem marcou)
 * 4. Sessão persistente: loading + initializeAuth com AsyncStorage (mantido)
 * 5. Swipe: nestedScrollEnabled em todas as 5 abas (mantido)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  update,
  get,
  remove,
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// CONFIGURAÇÃO DO FIREBASE — chaves reais do projeto pilula-ana
// ============================================================================
const firebaseConfig = {
  apiKey:            'AIzaSyChpMCwE1A8Yl3Cm4Oyhc0bJoXBJLSbPuo',
  authDomain:        'pilula-ana.firebaseapp.com',
  databaseURL:       'https://pilula-ana-default-rtdb.firebaseio.com',
  projectId:         'pilula-ana',
  storageBucket:     'pilula-ana.firebasestorage.app',
  messagingSenderId: '1005101278287',
  appId:             '1:1005101278287:android:e749bbfad114aacbfd763a',
};

const app     = initializeApp(firebaseConfig);
const auth    = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
const db      = getDatabase(app);
const storage = getStorage(app);

// ============================================================================
// CONSTANTES E HELPERS
// ============================================================================
const { width } = Dimensions.get('window');
const JANELA_OURO_INICIO = 20 * 60 + 30;
const JANELA_OURO_FIM   = 20 * 60 + 40;

const TEMAS = {
  roxo:    { primary: '#9C27B0', secondary: '#E1BEE7' },
  dourado: { primary: '#FFC107', secondary: '#FFE082' },
  ciano:   { primary: '#00BCD4', secondary: '#B2EBF2' },
  verde:   { primary: '#4CAF50', secondary: '#C8E6C9' },
};

const obterHoraAtual  = () => { const a = new Date(); return a.getHours() * 60 + a.getMinutes(); };
const obterDataAtual  = () => new Date().toISOString().split('T')[0];
const estaJanelaOuro  = () => { const h = obterHoraAtual(); return h >= JANELA_OURO_INICIO && h <= JANELA_OURO_FIM; };

const obterTempoRestante = () => {
  const h = obterHoraAtual();
  if (h < JANELA_OURO_INICIO) return JANELA_OURO_INICIO - h;
  if (h <= JANELA_OURO_FIM)   return JANELA_OURO_FIM - h;
  return 24 * 60 - h + JANELA_OURO_INICIO;
};

// ============================================================================
// APP
// ============================================================================
const App = () => {

  // --- Sessão persistente: estado inicial LOADING ---
  const [tela, setTela] = useState('loading');
  const [user, setUser] = useState(null);
  const [casalId, setCasalId]         = useState(null);
  const [outroUsuario, setOutroUsuario] = useState(null);
  const [tema, setTema]               = useState('roxo');
  const [loading, setLoading]         = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auth form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome]         = useState('');
  const [isRegistro, setIsRegistro] = useState(false);

  // Pair
  const [pairCode, setPairCode]           = useState('');
  const [inputPairCode, setInputPairCode] = useState('');

  // Dados
  const [historico,     setHistorico]     = useState({});
  const [pontos,        setPontos]        = useState({});
  const [streak,        setStreak]        = useState(0);
  const [consistencia,  setConsistencia]  = useState(0);
  const [fotos,         setFotos]         = useState({});
  const [tempoRestante, setTempoRestante] = useState(0);
  const [janelaAberta,  setJanelaAberta]  = useState(false);
  const [modalAmor,     setModalAmor]     = useState(false);

  // Swipe
  const scrollViewRef = useRef(null);
  const [abaIndex, setAbaIndex] = useState(0);
  const abas = ['Home', 'Calendário', 'Ranking', 'Sugestões', 'Perfil'];

  // ========================================================================
  // AUTH STATE — decide tela após Firebase restaurar sessão do AsyncStorage
  // ========================================================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const snap = await get(ref(db, `usuarios/${currentUser.uid}`));
        if (snap.exists()) {
          const data = snap.val();
          if (data.casalId) {
            setCasalId(data.casalId);
            carregarDadosCasal(data.casalId, currentUser.uid);
            setTela('app');
          } else {
            setTela('pair');
          }
        } else {
          setTela('pair');
        }
      } else {
        setUser(null);
        setCasalId(null);
        setTela('auth');
      }
    });
    return unsub;
  }, []);

  // Countdown / janela
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoRestante(obterTempoRestante());
      setJanelaAberta(estaJanelaOuro());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Notificação 20:30
  useEffect(() => {
    const interval = setInterval(async () => {
      const agora = new Date();
      if (agora.getHours() === 20 && agora.getMinutes() === 30) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '⏰ Janela de Ouro Aberta!', body: 'Hora de marcar que Ana tomou o Yazflex!', sound: 'default' },
          trigger: { seconds: 1 },
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ========================================================================
  // AUTH
  // ========================================================================
  const handleLogin = async () => {
    if (!email || !password) { setErrorMessage('Preencha email e senha.'); return; }
    setLoading(true); setErrorMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(''); setPassword('');
    } catch (e) { setErrorMessage(`Erro: ${e.message}`); }
    setLoading(false);
  };

  const handleRegistro = async () => {
    if (!email || !password || !nome) { setErrorMessage('Preencha todos os campos.'); return; }
    setLoading(true); setErrorMessage('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, `usuarios/${cred.user.uid}`), {
        nome, email, isAdmin: false, casalId: null, criadoEm: new Date().toISOString(),
      });
      setEmail(''); setPassword(''); setNome(''); setIsRegistro(false);
    } catch (e) { setErrorMessage(`Erro: ${e.message}`); }
    setLoading(false);
  };

  const handleLogout = async () => { try { await signOut(auth); } catch (e) {} };

  // ========================================================================
  // PAIR
  // ========================================================================
  const gerarCodigoPareamento = async () => {
    if (!user) return;
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    const novosCasalId = push(ref(db, 'casais')).key;
    await set(ref(db, `casais/${novosCasalId}`), {
      membros: { [user.uid]: email },
      historico: {},
      pausa: { ativa: false, inicio: null, fim: null },
      pontos: { [user.uid]: 0 },
      fotos: { [user.uid]: null },
      tema: 'roxo',
      sugestoes: {},
      dataInicio: obterDataAtual(),
      ultimaAcao: { quem: user.uid, hora: new Date().toISOString(), tipo: 'criacao' },
    });
    await set(ref(db, `pairCodes/${codigo}`), { casalId: novosCasalId });
    await update(ref(db, `usuarios/${user.uid}`), { casalId: novosCasalId });
    setPairCode(codigo);
    setCasalId(novosCasalId);
  };

  const usarCodigoPareamento = async () => {
    if (!inputPairCode || !user) { setErrorMessage('Insira um código válido.'); return; }
    try {
      const codeRef = ref(db, `pairCodes/${inputPairCode.toUpperCase()}`);
      const snap = await get(codeRef);
      if (!snap.exists()) { setErrorMessage('Código inválido ou expirado.'); return; }
      const { casalId: novoCasalId } = snap.val();
      await update(ref(db, `casais/${novoCasalId}/membros`), { [user.uid]: email });
      await update(ref(db, `casais/${novoCasalId}/pontos`),  { [user.uid]: 0 });
      await update(ref(db, `casais/${novoCasalId}/fotos`),   { [user.uid]: null });
      await update(ref(db, `usuarios/${user.uid}`), { casalId: novoCasalId });
      await remove(codeRef);
      setCasalId(novoCasalId);
      setInputPairCode('');
      carregarDadosCasal(novoCasalId, user.uid);
      setTela('app');
    } catch (e) { setErrorMessage(`Erro: ${e.message}`); }
  };

  // ========================================================================
  // DADOS
  // ========================================================================
  const carregarDadosCasal = (cid, uid) => {
    if (!cid) return;
    onValue(ref(db, `casais/${cid}/historico`), (s) => {
      const v = s.val() || {};
      setHistorico(v);
      calcularConsistencia(v);
      calcularStreakLocal(v);
    });
    onValue(ref(db, `casais/${cid}/pontos`),   (s) => setPontos(s.val() || {}));
    onValue(ref(db, `casais/${cid}/tema`),     (s) => setTema(s.val() || 'roxo'));
    onValue(ref(db, `casais/${cid}/fotos`),    (s) => setFotos(s.val() || {}));
    onValue(ref(db, `casais/${cid}/membros`),  (s) => {
      const membros = s.val() || {};
      const outroUid = Object.keys(membros).find((u) => u !== uid);
      if (outroUid) onValue(ref(db, `usuarios/${outroUid}`), (snap) => setOutroUsuario(snap.val()));
    });
  };

  const calcularConsistencia = (hist) => {
    const total = Object.keys(hist).length;
    if (!total) { setConsistencia(0); return; }
    const ok = Object.values(hist).filter((d) => d.tomou).length;
    setConsistencia(Math.round((ok / total) * 100));
  };

  const calcularStreakLocal = (hist) => {
    let s = 0;
    let d = new Date();
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (hist[key]?.tomou) { s++; d.setDate(d.getDate() - 1); } else break;
    }
    setStreak(s);
  };

  // ========================================================================
  // MARCAR TOMADA
  // Botão SEMPRE habilitado.
  // Regra: dentro da janela = ponto do outro (Ana); fora = ponto de quem marcou
  // ========================================================================
  const marcarTomada = async () => {
    if (!user || !casalId) return;
    const hoje = obterDataAtual();
    const agora = new Date();
    const hora = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;

    try {
      await set(ref(db, `casais/${casalId}/historico/${hoje}`), { data: hoje, hora, tomou: true });

      const pontosSnap = await get(ref(db, `casais/${casalId}/pontos`));
      const pontosAtuais = pontosSnap.val() || {};
      let pontoUid;
      if (estaJanelaOuro()) {
        pontoUid = Object.keys(pontosAtuais).find((u) => u !== user.uid) || user.uid;
      } else {
        pontoUid = user.uid;
      }
      await update(ref(db, `casais/${casalId}/pontos`), { [pontoUid]: (pontosAtuais[pontoUid] || 0) + 1 });

      await update(ref(db, `casais/${casalId}`), {
        ultimaAcao: { quem: user.uid, hora: agora.toISOString(), tipo: 'marcacao' },
      });

      setModalAmor(true);
      setTimeout(() => setModalAmor(false), 2000);

      if (outroUsuario) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '💊 Tomada marcada!', body: `Pílula marcada às ${hora}!`, sound: 'default' },
          trigger: { seconds: 1 },
        });
      }
    } catch (e) { setErrorMessage(`Erro ao marcar: ${e.message}`); }
  };

  // ========================================================================
  // FOTO DA GALERIA
  // FIX: requestMediaLibraryPermissionsAsync() ANTES de abrir o picker
  // FIX: base64:false + fetch(uri) → blob → uploadBytes → getDownloadURL → DB
  // ========================================================================
  const pickImageAndUpload = async () => {
    if (!user || !casalId) return;

    // Solicitar permissão (obrigatório no Android)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        // base64 NÃO — upload via blob
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        // URI → Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Upload para Firebase Storage
        const fotoRef = storageRef(storage, `casais/${casalId}/fotos/${user.uid}`);
        await uploadBytes(fotoRef, blob);

        // Salvar URL no Realtime DB
        const photoURL = await getDownloadURL(fotoRef);
        await set(ref(db, `casais/${casalId}/fotos/${user.uid}`), photoURL);

        Alert.alert('✅ Foto atualizada!');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar a foto: ' + e.message);
    }
  };

  // ========================================================================
  // SWIPE
  // ========================================================================
  const scrollToAba = (index) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    setAbaIndex(index);
  };

  const handleScroll = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== abaIndex) setAbaIndex(newIndex);
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  if (tela === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={TEMAS[tema].primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (tela === 'auth') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💊 Aninha 64</Text>
        <Text style={styles.subtitle}>{isRegistro ? 'Criar Conta' : 'Entrar'}</Text>
        {isRegistro && (
          <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} placeholderTextColor="#999" />
        )}
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />
        {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        <TouchableOpacity style={[styles.button, { backgroundColor: TEMAS[tema].primary }]} onPress={isRegistro ? handleRegistro : handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Aguarde...' : isRegistro ? 'Registrar' : 'Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setIsRegistro(!isRegistro); setErrorMessage(''); }}>
          <Text style={styles.toggleText}>{isRegistro ? 'Já tem conta? Entrar' : 'Criar nova conta'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (tela === 'pair') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💊 Pareamento</Text>
        {!pairCode ? (
          <TouchableOpacity style={[styles.button, { backgroundColor: TEMAS[tema].primary }]} onPress={gerarCodigoPareamento}>
            <Text style={styles.buttonText}>Gerar Código</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.subtitle}>Seu Código:</Text>
            <Text style={styles.pairCode}>{pairCode}</Text>
            <Text style={styles.pairInfo}>Compartilhe com sua parceira</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: TEMAS[tema].primary }]} onPress={() => { carregarDadosCasal(casalId, user.uid); setTela('app'); }}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Usar Código de Pareamento</Text>
        <TextInput style={styles.input} placeholder="Insira o código aqui" value={inputPairCode} onChangeText={setInputPairCode} autoCapitalize="characters" placeholderTextColor="#999" />
        {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        <TouchableOpacity style={[styles.button, { backgroundColor: TEMAS[tema].primary }]} onPress={usarCodigoPareamento} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Aguarde...' : 'Usar Código'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#999' }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // App principal
  return (
    <View style={[styles.appContainer, { backgroundColor: TEMAS[tema].secondary }]}>

      <Modal transparent visible={modalAmor} animationType="fade">
        <View style={styles.modalOverlay}>
          <Text style={styles.modalText}>❤️ Eu te amo amor ❤️</Text>
        </View>
      </Modal>

      {/* Barra de abas */}
      <View style={[styles.tabBar, { backgroundColor: TEMAS[tema].primary }]}>
        {abas.map((aba, index) => (
          <TouchableOpacity key={aba} style={[styles.tabItem, abaIndex === index && styles.tabItemSelected]} onPress={() => scrollToAba(index)}>
            <Text style={[styles.tabText, abaIndex === index && styles.tabTextSelected]}>{aba}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipe horizontal — nestedScrollEnabled em todas as abas */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Aba 1: Home */}
        <ScrollView style={styles.tabContent} nestedScrollEnabled={true}>
          <Text style={styles.tabTitle}>Home</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⏰ Janela de Ouro</Text>
            <Text style={styles.cardSubtitle}>20:30 - 20:40</Text>
            <Text style={[styles.cardText, { color: janelaAberta ? '#4CAF50' : '#FF9800' }]}>
              {janelaAberta ? '✅ Aberta agora!' : `⏳ Faltam ${tempoRestante} minutos`}
            </Text>
            {/* Botão SEMPRE habilitado */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: janelaAberta ? '#4CAF50' : TEMAS[tema].primary }]}
              onPress={marcarTomada}
            >
              <Text style={styles.buttonText}>{janelaAberta ? '✅ Marcar na Janela' : '💊 Marcar Tomada'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Estatísticas</Text>
            <Text style={styles.cardText}>Streak: 🔥 {streak} dias</Text>
            <Text style={styles.cardText}>Consistência: {consistencia}%</Text>
          </View>
        </ScrollView>

        {/* Aba 2: Calendário */}
        <ScrollView style={styles.tabContent} nestedScrollEnabled={true}>
          <Text style={styles.tabTitle}>Calendário</Text>
          <View style={styles.card}>
            {Object.entries(historico).sort(([a],[b]) => b.localeCompare(a)).map(([data, entrada]) => (
              <View key={data} style={styles.historicoItem}>
                <Text style={styles.historicoData}>{data}</Text>
                <Text style={styles.historicoHora}>{entrada.hora}</Text>
                <Text style={styles.historicoStatus}>{entrada.tomou ? '✅' : '❌'}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Aba 3: Ranking */}
        <ScrollView style={styles.tabContent} nestedScrollEnabled={true}>
          <Text style={styles.tabTitle}>Ranking</Text>
          <View style={styles.card}>
            {Object.entries(pontos).sort(([,a],[,b]) => b - a).map(([uid, ponto], index) => (
              <View key={uid} style={styles.rankingItem}>
                <Text style={styles.rankingPosition}>{index === 0 ? '🥇' : '🥈'}</Text>
                <Text style={styles.rankingName}>{uid === user?.uid ? 'Você' : outroUsuario?.nome || 'Outro'}</Text>
                <Text style={styles.rankingPoints}>{ponto} pontos</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Aba 4: Sugestões */}
        <ScrollView style={styles.tabContent} nestedScrollEnabled={true}>
          <Text style={styles.tabTitle}>Sugestões</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Espaço para sugestões e mensagens</Text>
          </View>
        </ScrollView>

        {/* Aba 5: Perfil */}
        <ScrollView style={styles.tabContent} nestedScrollEnabled={true}>
          <Text style={styles.tabTitle}>Perfil</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações</Text>
            <Text style={styles.cardText}>Email: {user?.email}</Text>
            <Text style={styles.cardText}>Casal ID: {casalId}</Text>
            {fotos[user?.uid] ? (
              <Image source={{ uri: fotos[user.uid] }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.button, { backgroundColor: TEMAS[tema].primary }]} onPress={pickImageAndUpload}>
              <Text style={styles.buttonText}>📸 Alterar Foto</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#FF5252' }]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
  container:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  appContainer:    { flex: 1, paddingTop: 50 },
  loadingText:     { marginTop: 10, fontSize: 16, color: '#333' },
  title:           { fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle:        { fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' },
  input:           { width: '100%', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12, fontSize: 16 },
  button:          { width: '100%', padding: 14, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  buttonText:      { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  error:           { color: '#FF5252', marginBottom: 12, textAlign: 'center', fontSize: 14 },
  toggleText:      { color: '#007bff', marginTop: 12, textAlign: 'center', fontSize: 14 },
  pairCode:        { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 12, letterSpacing: 2 },
  pairInfo:        { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  divider:         { height: 1, backgroundColor: '#ddd', marginVertical: 20, width: '100%' },
  tabBar:          { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.1)' },
  tabItem:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  tabItemSelected: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabText:         { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  tabTextSelected: { color: '#fff' },
  tabContent:      { width, padding: 16 },
  tabTitle:        { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle:       { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  cardSubtitle:    { fontSize: 14, color: '#666', marginBottom: 8 },
  cardText:        { fontSize: 14, color: '#333', marginBottom: 6 },
  historicoItem:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historicoData:   { fontSize: 14, fontWeight: '600', color: '#333' },
  historicoHora:   { fontSize: 14, color: '#666' },
  historicoStatus: { fontSize: 14, fontWeight: '600' },
  rankingItem:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rankingPosition: { fontSize: 20, marginRight: 12 },
  rankingName:     { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
  rankingPoints:   { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  profileImage:    { width: 120, height: 120, borderRadius: 60, marginVertical: 12, alignSelf: 'center' },
  modalOverlay:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalText:       { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
});

export default App;

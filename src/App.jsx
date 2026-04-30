import { useState } from 'react'
import Layout from './components/Layout.jsx'
import RagasView from './views/RagasView.jsx'
import VarisaiView from './views/VarisaiView.jsx'
import TalasView from './views/TalasView.jsx'
import HistoryView from './views/HistoryView.jsx'
import ToolsView from './views/ToolsView.jsx'

export default function App() {
  const [tab, setTab] = useState('ragas')

  return (
    <Layout active={tab} onChange={setTab}>
      {tab === 'ragas' && <RagasView />}
      {tab === 'varisai' && <VarisaiView />}
      {tab === 'talas' && <TalasView />}
      {tab === 'history' && <HistoryView />}
      {tab === 'tools' && <ToolsView onJumpToRaga={() => setTab('ragas')} />}
    </Layout>
  )
}

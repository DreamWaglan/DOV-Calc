import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import DamageCalculator from '../components/DamageCalculator.vue'
import EquipmentLookup from '../components/EquipmentLookup.vue'
import CalculatorShell from '../components/CalculatorShell.vue'
import PageStatus from './components/PageStatus.vue'
import SourceList from './components/SourceList.vue'
import RelatedPages from './components/RelatedPages.vue'
import ResponsiveMedia from './components/ResponsiveMedia.vue'
import WikiLayout from './WikiLayout.vue'
import './styles.css'

export default {
  extends: DefaultTheme,
  Layout: WikiLayout,
  enhanceApp({ app }) {
    app.component('DamageCalculator', DamageCalculator)
    app.component('EquipmentLookup', EquipmentLookup)
    app.component('CalculatorShell', CalculatorShell)
    app.component('PageStatus', PageStatus)
    app.component('SourceList', SourceList)
    app.component('RelatedPages', RelatedPages)
    app.component('ResponsiveMedia', ResponsiveMedia)
  },
} satisfies Theme

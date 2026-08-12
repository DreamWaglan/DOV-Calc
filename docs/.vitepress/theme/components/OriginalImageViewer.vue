<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

type ViewMode = 'fit' | 'actual' | 'custom'

interface Point {
  x: number
  y: number
}

interface PinchState {
  distance: number
  initialScale: number
  imagePoint: Point
}

const props = defineProps<{
  open: boolean
  src: string
  alt: string
  width: number
  height: number
}>()

const emit = defineEmits<{
  close: []
}>()

const mounted = ref(false)
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const scale = ref(1)
const fitScale = ref(1)
const viewMode = ref<ViewMode>('fit')
const stageWidth = ref(0)
const stageHeight = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })
const activePointers = new Map<number, Point>()
const pointerOrigins = new Map<number, Point>()
const movedPointers = new Set<number>()
const blockedTapPointers = new Set<number>()
let pinchState: PinchState | null = null
let previousFocus: HTMLElement | null = null
let scaleRevision = 0
let lastTap: { time: number; point: Point } | null = null

const safeWidth = computed(() => Math.max(1, props.width))
const safeHeight = computed(() => Math.max(1, props.height))
const scaledWidth = computed(() => Math.max(1, safeWidth.value * scale.value))
const scaledHeight = computed(() => Math.max(1, safeHeight.value * scale.value))
const canvasWidth = computed(() => scaledWidth.value + stageWidth.value * 2)
const canvasHeight = computed(() => scaledHeight.value + stageHeight.value * 2)
const minimumScale = computed(() => Math.max(0.01, Math.min(1, fitScale.value) / 2))
const maximumScale = 8
const zoomPercent = computed(() => Math.round(scale.value * 100))
const dialogLabel = computed(() => `查看原图：${props.alt}`)
const canvasStyle = computed(() => ({
  width: `${canvasWidth.value}px`,
  height: `${canvasHeight.value}px`,
}))
const imageStyle = computed(() => ({
  width: `${scaledWidth.value}px`,
  height: `${scaledHeight.value}px`,
}))

function clampScale(value: number) {
  return Math.min(maximumScale, Math.max(minimumScale.value, value))
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function measureStage() {
  const element = stage.value
  if (!element) return
  stageWidth.value = element.clientWidth
  stageHeight.value = element.clientHeight
  const availableWidth = Math.max(1, element.clientWidth - 32)
  const availableHeight = Math.max(1, element.clientHeight - 32)
  fitScale.value = Math.max(
    0.01,
    Math.min(1, availableWidth / safeWidth.value, availableHeight / safeHeight.value),
  )
}

function stagePoint(clientX: number, clientY: number): Point {
  const rect = stage.value?.getBoundingClientRect()
  return {
    x: rect ? clientX - rect.left : stageWidth.value / 2,
    y: rect ? clientY - rect.top : stageHeight.value / 2,
  }
}

function stageCenter(): Point {
  const element = stage.value
  return {
    x: (element?.clientWidth ?? stageWidth.value) / 2,
    y: (element?.clientHeight ?? stageHeight.value) / 2,
  }
}

function imagePointAt(anchor: Point): Point {
  const element = stage.value
  if (!element) {
    return { x: safeWidth.value / 2, y: safeHeight.value / 2 }
  }
  const imageLeft = (canvasWidth.value - scaledWidth.value) / 2
  const imageTop = (canvasHeight.value - scaledHeight.value) / 2
  return {
    x: clamp(
      (element.scrollLeft + anchor.x - imageLeft) / scale.value,
      0,
      safeWidth.value,
    ),
    y: clamp(
      (element.scrollTop + anchor.y - imageTop) / scale.value,
      0,
      safeHeight.value,
    ),
  }
}

async function centerStage() {
  await nextTick()
  const element = stage.value
  if (!element) return
  element.scrollLeft = Math.max(0, (element.scrollWidth - element.clientWidth) / 2)
  element.scrollTop = Math.max(0, (element.scrollHeight - element.clientHeight) / 2)
}

async function applyScale(
  nextScale: number,
  mode: ViewMode,
  anchor = stageCenter(),
  fixedImagePoint?: Point,
) {
  const element = stage.value
  const imagePoint = fixedImagePoint ?? imagePointAt(anchor)
  const revision = ++scaleRevision
  scale.value = clampScale(nextScale)
  viewMode.value = mode
  await nextTick()

  if (!element || revision !== scaleRevision) return
  const imageLeft = (canvasWidth.value - scaledWidth.value) / 2
  const imageTop = (canvasHeight.value - scaledHeight.value) / 2
  element.scrollLeft = imageLeft + imagePoint.x * scale.value - anchor.x
  element.scrollTop = imageTop + imagePoint.y * scale.value - anchor.y
}

async function fitImage() {
  measureStage()
  scaleRevision += 1
  scale.value = fitScale.value
  viewMode.value = 'fit'
  await centerStage()
}

function showActualSize(anchor = stageCenter()) {
  return applyScale(1, 'actual', anchor)
}

function zoomIn() {
  return applyScale(scale.value * 1.25, 'custom')
}

function zoomOut() {
  return applyScale(scale.value / 1.25, 'custom')
}

function toggleFitActual(anchor: Point) {
  const isFit = viewMode.value === 'fit' || Math.abs(scale.value - fitScale.value) < 0.001
  return isFit ? showActualSize(anchor) : fitImage()
}

function close() {
  emit('close')
}

function panBy(key: string) {
  const element = stage.value
  if (!element) return
  const distance = 80
  const offsets: Record<string, Point> = {
    ArrowLeft: { x: -distance, y: 0 },
    ArrowRight: { x: distance, y: 0 },
    ArrowUp: { x: 0, y: -distance },
    ArrowDown: { x: 0, y: distance },
  }
  const offset = offsets[key]
  if (offset) element.scrollBy(offset.x, offset.y)
}

function onDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    void zoomIn()
    return
  }
  if (event.key === '-' || event.key === '_') {
    event.preventDefault()
    void zoomOut()
    return
  }
  if (event.key === '0') {
    event.preventDefault()
    void showActualSize()
    return
  }
  if (event.key.toLowerCase() === 'f') {
    event.preventDefault()
    void fitImage()
    return
  }
  if (event.key.startsWith('Arrow')) {
    event.preventDefault()
    panBy(event.key)
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return

  const focusable = [...dialog.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hasAttribute('hidden'))
  if (!focusable.length) {
    event.preventDefault()
    dialog.value.focus()
    return
  }

  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function distanceBetween(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

function midpoint(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  }
}

function pointerPair() {
  return [...activePointers.values()].slice(0, 2)
}

function beginPinch() {
  const pair = pointerPair()
  if (pair.length < 2) return
  const anchor = midpoint(pair[0], pair[1])
  pinchState = {
    distance: Math.max(1, distanceBetween(pair[0], pair[1])),
    initialScale: scale.value,
    imagePoint: imagePointAt(anchor),
  }
  for (const pointerId of activePointers.keys()) blockedTapPointers.add(pointerId)
  isDragging.value = false
}

function safelyCapturePointer(element: HTMLElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId)
  } catch {
    // Synthetic pointer events used by browser tests do not create native capture state.
  }
}

function safelyReleasePointer(element: HTMLElement, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
  } catch {
    // The pointer may already have been released by the browser.
  }
}

function onPointerDown(event: PointerEvent) {
  const element = stage.value
  if (!element || (event.pointerType === 'mouse' && event.button !== 0)) return
  const point = stagePoint(event.clientX, event.clientY)
  activePointers.set(event.pointerId, point)
  pointerOrigins.set(event.pointerId, point)
  safelyCapturePointer(element, event.pointerId)

  if (activePointers.size >= 2) {
    beginPinch()
    return
  }

  isDragging.value = true
  dragStart.value = {
    x: point.x,
    y: point.y,
    left: element.scrollLeft,
    top: element.scrollTop,
  }
}

function onPointerMove(event: PointerEvent) {
  const element = stage.value
  if (!element || !activePointers.has(event.pointerId)) return
  const point = stagePoint(event.clientX, event.clientY)
  activePointers.set(event.pointerId, point)
  const origin = pointerOrigins.get(event.pointerId)
  if (origin && distanceBetween(origin, point) > 8) movedPointers.add(event.pointerId)

  if (activePointers.size >= 2) {
    event.preventDefault()
    if (!pinchState) beginPinch()
    const pair = pointerPair()
    if (!pinchState || pair.length < 2) return
    const anchor = midpoint(pair[0], pair[1])
    const distance = Math.max(1, distanceBetween(pair[0], pair[1]))
    void applyScale(
      pinchState.initialScale * (distance / pinchState.distance),
      'custom',
      anchor,
      pinchState.imagePoint,
    )
    return
  }

  if (!isDragging.value) return
  element.scrollLeft = dragStart.value.left - (point.x - dragStart.value.x)
  element.scrollTop = dragStart.value.top - (point.y - dragStart.value.y)
}

function handleTouchTap(point: Point) {
  const now = Date.now()
  if (
    lastTap &&
    now - lastTap.time <= 320 &&
    distanceBetween(lastTap.point, point) <= 32
  ) {
    lastTap = null
    void toggleFitActual(point)
    return
  }
  lastTap = { time: now, point }
}

function endPointer(event: PointerEvent, allowTap: boolean) {
  const element = stage.value
  if (!element || !activePointers.has(event.pointerId)) return
  const point = activePointers.get(event.pointerId) ?? stagePoint(event.clientX, event.clientY)
  const isTap =
    allowTap &&
    event.pointerType === 'touch' &&
    activePointers.size === 1 &&
    !movedPointers.has(event.pointerId) &&
    !blockedTapPointers.has(event.pointerId)

  safelyReleasePointer(element, event.pointerId)
  activePointers.delete(event.pointerId)
  pointerOrigins.delete(event.pointerId)
  movedPointers.delete(event.pointerId)
  blockedTapPointers.delete(event.pointerId)

  if (activePointers.size < 2) pinchState = null
  if (activePointers.size === 1) {
    const [remainingPoint] = activePointers.values()
    dragStart.value = {
      x: remainingPoint.x,
      y: remainingPoint.y,
      left: element.scrollLeft,
      top: element.scrollTop,
    }
    isDragging.value = true
  } else if (activePointers.size === 0) {
    isDragging.value = false
  }

  if (isTap) handleTouchTap(point)
}

function onPointerUp(event: PointerEvent) {
  endPointer(event, true)
}

function onPointerCancel(event: PointerEvent) {
  endPointer(event, false)
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const anchor = stagePoint(event.clientX, event.clientY)
  const factor = Math.exp(-event.deltaY * 0.0015)
  void applyScale(scale.value * factor, 'custom', anchor)
}

function onDoubleClick(event: MouseEvent) {
  event.preventDefault()
  void toggleFitActual(stagePoint(event.clientX, event.clientY))
}

function resetPointers() {
  activePointers.clear()
  pointerOrigins.clear()
  movedPointers.clear()
  blockedTapPointers.clear()
  pinchState = null
  lastTap = null
  isDragging.value = false
}

function onResize() {
  measureStage()
  if (viewMode.value === 'fit') {
    scaleRevision += 1
    scale.value = fitScale.value
    void centerStage()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (!mounted.value) return
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null
      document.documentElement.classList.add('image-viewer-open')
      await nextTick()
      await fitImage()
      closeButton.value?.focus()
      window.addEventListener('resize', onResize)
    } else {
      resetPointers()
      document.documentElement.classList.remove('image-viewer-open')
      window.removeEventListener('resize', onResize)
      previousFocus?.focus()
      previousFocus = null
    }
  },
)

onMounted(() => {
  mounted.value = true
})

onBeforeUnmount(() => {
  resetPointers()
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('image-viewer-open')
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onResize)
  }
})
</script>

<template>
  <Teleport v-if="mounted && open" to="body">
    <div class="image-viewer" @click.self="close">
      <section
        ref="dialog"
        class="image-viewer__dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        tabindex="-1"
        @keydown="onDialogKeydown"
      >
        <header class="image-viewer__toolbar">
          <div class="image-viewer__controls" aria-label="图片缩放控制">
            <button
              type="button"
              :disabled="scale <= minimumScale"
              aria-label="缩小图片"
              title="缩小（-）"
              @click="zoomOut"
            >
              −
            </button>
            <output class="image-viewer__zoom" aria-live="polite">
              {{ zoomPercent }}%
            </output>
            <button
              type="button"
              :disabled="scale >= maximumScale"
              aria-label="放大图片"
              title="放大（+）"
              @click="zoomIn"
            >
              +
            </button>
            <button type="button" title="适应窗口（F）" @click="fitImage">
              适应窗口
            </button>
            <button type="button" title="原始尺寸（0）" @click="showActualSize()">
              100%
            </button>
          </div>
          <button
            ref="closeButton"
            class="image-viewer__close"
            type="button"
            aria-label="关闭原图查看器"
            title="关闭（Esc）"
            @click="close"
          >
            ×
          </button>
        </header>

        <div
          ref="stage"
          class="image-viewer__stage"
          :class="{ 'image-viewer__stage--dragging': isDragging }"
          role="region"
          aria-label="原图查看区域；可滚轮或双指缩放，方向键或拖动浏览，双击或双击触控切换适应窗口与原始尺寸"
          tabindex="0"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
          @dblclick="onDoubleClick"
          @wheel="onWheel"
        >
          <div class="image-viewer__canvas" :style="canvasStyle">
            <img
              class="image-viewer__image"
              :src="src"
              :alt="alt"
              :width="width"
              :height="height"
              :style="imageStyle"
              draggable="false"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

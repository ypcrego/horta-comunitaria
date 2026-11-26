import { useRef, useState } from 'react'
import type { CanteirosState } from '@/shared/types'
import {
  addCanteiro as addCanteiroToState,
  addPlantingRecord as addPlantingRecordToState,
  updateCanteiro as updateCanteiroInState,
  type NewCanteiroInput,
  type NewPlantingRecordInput,
} from '../lib/canteiros'
import { loadCanteirosState, saveCanteirosState } from '../lib/canteirosStorage'

export function useCanteiros() {
  const [state, setState] = useState<CanteirosState>(loadCanteirosState)
  const stateRef = useRef(state)

  function commit(nextState: CanteirosState) {
    stateRef.current = nextState
    setState(nextState)
    saveCanteirosState(nextState)
  }

  function registerRecord(input: NewPlantingRecordInput, actor: string): string | null {
    const result = addPlantingRecordToState(stateRef.current, input, actor)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  function addCanteiro(input: NewCanteiroInput): string | null {
    const result = addCanteiroToState(stateRef.current, input)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  function updateCanteiro(canteiroId: number, input: NewCanteiroInput): string | null {
    const result = updateCanteiroInState(stateRef.current, canteiroId, input)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  return {
    canteiros: state.canteiros,
    records: state.records,
    registerRecord,
    addCanteiro,
    updateCanteiro,
  }
}

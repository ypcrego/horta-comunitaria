import { useRef, useState } from 'react'
import type { InventoryState } from '@/shared/types'
import {
  addInventoryItem as addInventoryItemToState,
  requestItem as requestItemInState,
  returnLoan as returnLoanInState,
  type NewInventoryItemInput,
} from '../lib/inventory'
import { loadInventoryState, saveInventoryState } from '../lib/inventoryStorage'

export function useInventory() {
  const [state, setState] = useState<InventoryState>(loadInventoryState)
  const stateRef = useRef(state)

  function commit(nextState: InventoryState) {
    stateRef.current = nextState
    setState(nextState)
    saveInventoryState(nextState)
  }

  function requestItem(itemId: number, quantity: number, requester: string): string | null {
    const result = requestItemInState(stateRef.current, itemId, quantity, requester)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  function returnLoan(loanId: number, actor: string): string | null {
    const result = returnLoanInState(stateRef.current, loanId, actor)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  function addItem(input: NewInventoryItemInput, actor: string): string | null {
    const result = addInventoryItemToState(stateRef.current, input, actor)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  return {
    items: state.items,
    movements: state.movements,
    requestItem,
    returnLoan,
    addItem,
  }
}

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSale } from '@/lib/actions'
import { Trash2, Loader2 } from 'lucide-react'

interface Props {
  saleId: string
  productName: string
}

export default function DeleteSaleButton({ saleId, productName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`¿Eliminar la venta de "${productName}"?`)) return

    startTransition(async () => {
      try {
        await deleteSale(saleId)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error eliminando venta')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/50 transition-colors flex-shrink-0"
      title="Eliminar venta"
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  )
}

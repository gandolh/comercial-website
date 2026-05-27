import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateListing,
  renewListing,
  deactivateListing,
  activateListing,
  deleteListing,
  type UpdateListingRequest,
} from '@app/modules/listings/services/listings'

export function useListingMutations() {
  const qc = useQueryClient()

  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['me', 'listings'] })
    if (id) {
      qc.invalidateQueries({ queryKey: ['listing', id] })
    }
  }

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; patch: UpdateListingRequest }) =>
      updateListing(args.id, args.patch),
    onSuccess: (_, variables) => invalidate(variables.id),
  })

  const renewMutation = useMutation({
    mutationFn: (id: string) => renewListing(id),
    onSuccess: (_, id) => invalidate(id),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateListing(id),
    onSuccess: (_, id) => invalidate(id),
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateListing(id),
    onSuccess: (_, id) => invalidate(id),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => invalidate(),
  })

  return {
    update: updateMutation,
    renew: renewMutation,
    deactivate: deactivateMutation,
    activate: activateMutation,
    remove: deleteMutation,
  }
}

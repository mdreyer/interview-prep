// 5.4 WishlistButton. The spec is in README.md in this folder.
import { useRef, useState } from 'react';

export function WishlistButton({
  itemId,
  itemName,
  initialWishlisted,
  setWishlisted,
}: {
  itemId: string;
  itemName: string;
  initialWishlisted: boolean;
  setWishlisted: (itemId: string, wishlisted: boolean) => Promise<void>;
}) {
  // TODO: build it!
  return <button type="button">Wishlist {itemName}</button>;
}

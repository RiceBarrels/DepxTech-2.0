"use client"

import { Button } from '@/components/ui/button'
import { 
    ShoppingCartIcon, 
    HeartIcon, 
    ShareIcon, 
    EditIcon, 
    TrashIcon,
    DollarSignIcon
} from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from './drawer'
import { useAuth } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { Input } from './input'
import { Label } from './label'
import { Separator } from './separator'
import { MinusIcon } from 'lucide-react'
import { PlusIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ProductActions({
    product,
    isAdmin = false,
    onEdit,
    onDelete,
    onToggleFavorite
}) {
    const { addToCart, getCart, user } = useAuth()
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [amount, setAmount] = useState(1)
    const [cartItems, setCartItems] = useState([])
    const [isInCart, setIsInCart] = useState(false)
    const [currentCartAmount, setCurrentCartAmount] = useState(0)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const stocks = product.stocks

    // Fetch cart items when component mounts or user changes
    useEffect(() => {
        if (user) {
            fetchCartItems()
        } else {
            setCartItems([])
            setIsInCart(false)
            setCurrentCartAmount(0)
        }
    }, [user])

    const fetchCartItems = async () => {
        try {
            const result = await getCart()
            if (result.success) {
                setCartItems(result.cart)
                checkIfInCart(result.cart)
            }
        } catch (error) {
            console.error('Error fetching cart:', error)
        }
    }

    const checkIfInCart = (cart) => {
        const existingItem = cart.find(item => item.productId === product.id)
        if (existingItem) {
            setIsInCart(true)
            setCurrentCartAmount(parseInt(existingItem.amount))
        } else {
            setIsInCart(false)
            setCurrentCartAmount(0)
        }
    }

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login to add items to cart')
            return
        }

        setLoading(true)
        try {
            const result = await addToCart(product.id, amount)
            if (result.success) {
                const actionText = isInCart ? "Cart updated successfully!" : "Item added to cart successfully!"
                toast.success(actionText, {
                    description: "You can view your cart in the cart page",
                    action: {
                        label: "View Cart",
                        onClick: () => router.push('/cart')
                    }
                })
                setIsCartOpen(false)
                // Refresh cart status
                fetchCartItems()
            } else {
                toast.error('Failed to add item to cart: ' + result.error)
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            toast.error('Failed to add item to cart')
        } finally {
            setLoading(false)
        }
    }

    const getButtonText = () => {
        if (stocks === 0) return 'Out of Stock'
        if (isInCart) return `In Cart (${amount})`
        return 'Add to Cart'
    }

    const getDrawerTitle = () => {
        return isInCart ? 'Update Cart' : 'Add to Cart'
    }

    useEffect(() => {
        if (isInCart) {
            if(currentCartAmount > stocks) {
                setAmount(10)
            } else {
                setAmount(currentCartAmount)
            }
            
        } else {
            setAmount(1)
        }
    }, [isInCart, currentCartAmount])

    return (
        <div className="sticky bottom-2 bg-background/50 backdrop-blur-lg p-4 rounded-xl border">
            {/* Customer Actions */}
            {!isAdmin && (
                <div className="flex gap-3">
                    <Button 
                        className="flex-1" 
                        onClick={() => setIsCartOpen(true)}
                        disabled={stocks === 0}
                        variant={isInCart ? "secondary" : "default"}
                    >
                        <ShoppingCartIcon className="w-4 h-4 mr-2" />
                        {getButtonText()}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => onToggleFavorite?.(product)}
                    >
                        <HeartIcon className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => navigator.share({
                            title: product.title,
                            text: product.description,
                            url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.id}`
                        })}
                    >
                        <ShareIcon className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Admin Actions */}
            {isAdmin && (
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => onEdit?.(product)}
                    >
                        <EditIcon className="w-4 h-4 mr-2" />
                        Edit Product
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={() => onDelete?.(product)}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{getDrawerTitle()}</DrawerTitle>
                    </DrawerHeader>
                    <div className='flex flex-col items-center justify-center p-4 w-full gap-2'>
                        <Separator />

                        <div className='flex flex-row items-center justify-between w-full gap-2'>
                            {/* Product Image */}
                            <div className='flex flex-row items-center justify-center 0/5 size-24 p-2 rounded-full'>
                                <Image src={product.imgs[0]} alt={product.title} width={100} height={100} className='rounded-full' />
                            </div>
                            <div className='flex flex-col items-start justify-center flex-1 p-2'>
                                <h3 className='text-lg font-bold'>{product.title}</h3>
                                <p className='text-sm text-gray-500'>{product.price}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className='flex flex-row items-center justify-between w-full'>
                            <div className='flex flex-col items-start justify-center gap-2'>
                                <Label htmlFor='amount'>Quantity to {isInCart ? 'add' : 'add'}</Label>
                                <small className='text-xs text-gray-500'>{stocks} in stock</small>
                            </div>
                            <div className='flex flex-row items-center justify-center max-w-42 gap-1'>
                                <Button size="icon" onClick={() => {
                                    setAmount(amount - 1)
                                    if (amount-1 < 1) {
                                        setAmount(1)
                                    }
                                }} disabled={amount <= 1}><MinusIcon className='w-4 h-4' /></Button>
                                <Input id='amount' className="text-center" type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || 1)} onBlur={() => {
                                    if (amount < 1) {
                                        setAmount(1)
                                    }
                                    if (amount > stocks) {
                                        setAmount(stocks)
                                    }
                                }} />
                                <Button size="icon" onClick={() => {
                                    setAmount(amount + 1)
                                    if (amount+1 > stocks) {
                                        setAmount(stocks)
                                    }
                                }} disabled={amount >= stocks}><PlusIcon className='w-4 h-4' /></Button>
                            </div>
                        </div>
                        <Separator />
                    </div>
                    <DrawerFooter className='flex flex-row gap-4'>
                        <Button variant="outline" className='flex-1' onClick={() => setIsCartOpen(false)}>
                            <DollarSignIcon className='w-4 h-4 mr-2' />
                            Buy Now
                        </Button>
                        <Button 
                            className='flex-1' 
                            onClick={handleAddToCart}
                            disabled={loading}
                        >
                            <ShoppingCartIcon className='w-4 h-4 mr-2' />
                            {loading ? 'Adding...' : (isInCart ? 'Update Cart' : 'Add to Cart')}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    )
} 
'use client'

import React, { useState, useEffect } from 'react'
import { Bell, PizzaIcon, Package, ChevronRightIcon, BotIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as Dialog from '@radix-ui/react-dialog'; // Importando o Dialog do Radix UI
import { supabase } from '../lib/supabaseClient'
import { Oval } from 'react-loader-spinner'

// Definição do tipo Order (Pedido)
interface Order {
  id: string;
  nomeCliente: string;
  pedidoJSON: string;
  pedido: string;
  valorTotal: string;
  status: string;
}

// Definição do tipo Ingredient (Ingrediente)
interface Ingredient {
  id_ingrediente: string;
  nome_ingrediente: string;
  quantidade_disponivel: number;
}

// Função para buscar pedidos no Supabase
const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('n8n_listacerta')
    .select('id, nomeCliente, pedidoJSON, pedido, valorTotal, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar pedidos:', error.message)
    return []
  }

  return data || []
}

// Função para buscar ingredientes no Supabase
const fetchInventory = async (): Promise<Ingredient[]> => {
  const { data, error } = await supabase
    .from('ingredientes')
    .select('id_ingrediente, nome_ingrediente, quantidade_disponivel')

  if (error) {
    console.error('Erro ao buscar inventário:', error.message)
    return []
  }

  return data || []
}

// Função para atualizar o estoque de um ingrediente
const updateIngredientStock = async (id_ingrediente: string, novaQuantidade: number) => {
  const { data, error } = await supabase
    .from('ingredientes')
    .update({ quantidade_disponivel: novaQuantidade })
    .eq('id_ingrediente', id_ingrediente)

  if (error) {
    console.error('Erro ao atualizar estoque:', error.message)
    return null
  }

  return data
}

// Função para determinar a cor do estoque
const getStockColor = (quantidade: number) => {
  if (quantidade >= 20) {
    return "bg-green-500 text-white"
  } else if (quantidade >= 4 && quantidade < 20) {
    return "bg-orange-500 text-white"
  } else {
    return "bg-red-500 text-white"
  }
}

const LowStockPopup = ({ quantidade }: { quantidade: number }) => {
  const [isOpen, setIsOpen] = useState(quantidade <= 3);

  useEffect(() => {
    if (quantidade <= 3) {
      setIsOpen(true); // Abre o pop-up se a quantidade for baixa
    }
  }, [quantidade]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 bg-white rounded-lg p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2">
        <Dialog.Title className="text-lg font-semibold text-red-600">
          Alerta de Estoque!
        </Dialog.Title>
        <p className="text-gray-700">
          {quantidade > 0
            ? `Estoque baixo! Restam apenas ${quantidade} unidades.`
            : 'Estoque vazio!'}
        </p>
        <Dialog.Close asChild>
          <Button className="mt-4" onClick={() => setIsOpen(false)}>Fechar</Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
};


// Loader de pizza
const PizzaLoader = () => (
  <div className="flex justify-center items-center h-full">
    <Oval
      height={80}
      width={80}
      color="tomato"
      secondaryColor="orange"
      strokeWidth={5}
      strokeWidthSecondary={5}
    />
  </div>
)

// Tela de pedidos
const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    try {
      const newStatus = getNextStatus(currentStatus); // Obtém o próximo status
      console.log('Mudando status de:', currentStatus, 'para:', newStatus); // Log para depuração
  
      const updatedOrder = await updateOrderStatus(orderId, newStatus); // Atualiza o status no banco de dados
  
      if (updatedOrder) {
        console.log('Pedido atualizado com sucesso:', updatedOrder); // Log para verificar se o pedido foi atualizado
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order // Atualiza localmente
        ));
      } else {
        console.error('Erro: O pedido não foi atualizado.');
      }
    } catch (error) {
      console.error('Erro ao mudar o status:', error);
    }
  };
  
  // Função para atualizar o status do pedido no servidor (exemplo genérico)
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
      .from('n8n_listacerta')
      .select('id, nomeCliente, pedidoJSON, pedido, valorTotal, status')
      .order('created_at', { ascending: false })
  
      if (error) {
        console.error('Erro ao atualizar o status no banco de dados:', error);
        return null;
      }
  
      console.log('Resposta da atualização no banco de dados:', data); // Log para verificar a resposta
      return data ? data[0] : null; // Retorna o primeiro pedido atualizado
    } catch (error) {
      console.error('Erro ao tentar atualizar o status:', error);
      return null;
    }
  };
  

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pendente':
        return 'Preparando';
      case 'Preparando':
        return 'Entregue';
      case 'Entregue':
        return 'Concluído'; // Caso exista um status final
      default:
        return 'Pendente'; // Status padrão se não reconhecido
    }
  };




  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente": return "bg-yellow-500"
      case "Preparando": return "bg-blue-500"
      case "Entregue": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PizzaLoader />
        ) : orders.length === 0 ? (
          <p>Nenhum pedido disponível</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.pedido}</TableCell>
                  <TableCell>{order.nomeCliente}</TableCell>
                  <TableCell>R$ {order.valorTotal}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, order.status)}
                    >
                      Mudar Status <ChevronRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

// Tela de inventário (ingredientes) com função de restoque e pop-up elegante
const InventoryScreen = () => {
  const [inventory, setInventory] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newQuantity, setNewQuantity] = useState<number | null>(null)

  useEffect(() => {
    fetchInventory().then((data) => {
      setInventory(data)
      setLoading(false)
    })
  }, [])

  const handleRestock = (id_ingrediente: string, quantidade_atual: number) => {
    setEditingId(id_ingrediente)
    setNewQuantity(quantidade_atual)
  }

  const handleSaveRestock = async (id_ingrediente: string) => {
    if (newQuantity !== null) {
      await updateIngredientStock(id_ingrediente, newQuantity);
      setInventory(inventory.map(item =>
        item.id_ingrediente === id_ingrediente
          ? { ...item, quantidade_disponivel: newQuantity }
          : item
      ));
      setEditingId(null); // Resetando o estado de edição
      setNewQuantity(null); // Resetando o estado de nova quantidade
    }
  };

  // Função para determinar a cor do estoque e aplicar o estilo arredondado
  const getStockColor = (quantidade: number) => {
    if (quantidade >= 20) {
      return "bg-green-500 text-white rounded-full px-3 py-1" // Estilo arredondado
    } else if (quantidade >= 4 && quantidade < 20) {
      return "bg-orange-500 text-white rounded-full px-3 py-1" // Estilo arredondado
    } else {
      return "bg-red-500 text-white rounded-full px-3 py-1" // Estilo arredondado
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventário</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PizzaLoader />
        ) : inventory.length === 0 ? (
          <p>Nenhum ingrediente disponível</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((ingredient) => (
                <>
                  <TableRow key={ingredient.id_ingrediente}>
                    <TableCell>{ingredient.id_ingrediente}</TableCell>
                    <TableCell>{ingredient.nome_ingrediente}</TableCell>
                    <TableCell>
                      <Badge className={getStockColor(ingredient.quantidade_disponivel)}>
                        {editingId === ingredient.id_ingrediente ? (
                          <input
                            type="number"
                            value={newQuantity ?? ingredient.quantidade_disponivel}
                            onChange={(e) => setNewQuantity(parseInt(e.target.value))}
                            className="border border-gray-300 rounded-md p-1 text-black" // Input de edição com cor preta
                          />
                        ) : (
                          ingredient.quantidade_disponivel
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === ingredient.id_ingrediente ? (
                        <Button size="sm" onClick={() => handleSaveRestock(ingredient.id_ingrediente)}>
                          Salvar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestock(ingredient.id_ingrediente, ingredient.quantidade_disponivel)}
                        >
                          Restocar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {ingredient.quantidade_disponivel <= 3 && (
                    <LowStockPopup quantidade={ingredient.quantidade_disponivel} />
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

// Tela de Chat com o iframe
const ChatScreen = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chatbot</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PizzaLoader />
        ) : (
          <iframe
            src="https://udify.app/chatbot/UjMjeXbqLT6ex8lt"
            style={{ width: '100%', height: '100%', minHeight: '700px' }}
            frameBorder="0"
            allow="microphone"
            onLoad={() => setLoading(false)}
          ></iframe>
        )}
      </CardContent>
    </Card>
  )
}

// Função principal de controle de pedidos de pizza, inventário e chat
export function PizzaOrderControl() {
  const [activeScreen, setActiveScreen] = useState<'orders' | 'inventory' | 'chat'>('orders')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <nav>
            <Button
              variant={activeScreen === 'orders' ? 'default' : 'outline'}
              className="mr-2"
              onClick={() => setActiveScreen('orders')}
            >
              <PizzaIcon className="mr-2 h-4 w-4" /> Pedidos
            </Button>
            <Button
              variant={activeScreen === 'inventory' ? 'default' : 'outline'}
              className="mr-2"
              onClick={() => setActiveScreen('inventory')}
            >
              <Package className="mr-2 h-4 w-4" /> Inventário
            </Button>
            <Button
              variant={activeScreen === 'chat' ? 'default' : 'outline'}
              onClick={() => setActiveScreen('chat')}
            >
              <BotIcon className="mr-2 h-4 w-4" /> Chat
            </Button>
          </nav>
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-gray-500 mr-4" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeScreen === 'orders' && <OrdersScreen />}
        {activeScreen === 'inventory' && <InventoryScreen />}
        {activeScreen === 'chat' && <ChatScreen />}
      </main>
    </div>
  )
}

export default PizzaOrderControl

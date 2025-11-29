# Guia de Funcionamento da Aplicação "Doce Caixa"

Este documento explica como as diferentes partes da sua aplicação de dashboard funcionam e interagem entre si, com foco no fluxo de dados.

## 1. Arquitetura Geral

A aplicação segue uma arquitetura de 3 camadas para separar as responsabilidades, o que a torna organizada e fácil de manter.

1.  **Camada de UI (Interface do Usuário)** - `(src/app)`
    *   São os componentes que você vê na tela (páginas, botões, tabelas).
    *   Eles são responsáveis por exibir os dados e capturar as interações do usuário (como um clique de botão).
    *   **Importante:** A UI **nunca** fala diretamente com o banco de dados. Ela sempre passa por um "intermediário".

2.  **Camada de Serviço (O Intermediário)** - `(src/services)`
    *   Esta camada atua como uma ponte entre a UI e os dados.
    *   Ela contém funções com nomes claros como `getOrders()` ou `addSupply()`.
    *   **Vantagem:** Se um dia trocarmos o banco de dados, só precisamos alterar a Camada de Serviço. A UI continuará funcionando da mesma forma, sem precisar de alterações.

3.  **Camada de Dados (O "Banco de Dados")** - `(src/data)`
    *   Atualmente, esta camada simula um banco de dados usando arquivos em memória (`db.ts`).
    *   Ela armazena os dados brutos (listas de pedidos, produtos, insumos) e contém a lógica para manipulá-los diretamente.

**Fluxo de Dados Típico:** Um componente na UI (ex: a página de Pedidos) precisa exibir os pedidos -> ele chama a função `getOrders()` da Camada de Serviço -> a função `getOrders()` busca os dados na Camada de Dados e os retorna para a UI, que então os exibe na tela.

---

## 2. Detalhamento das Páginas e Interações

Aqui está o passo a passo de como cada página funciona:

### a) Página: `Dashboard` (`/admin/dashboard`)

*   **O que faz?**
    *   Apresenta uma visão geral e em tempo real do negócio.
    *   Exibe métricas rápidas (cards), gráficos de vendas, produtos populares, fluxo de caixa e movimentações financeiras recentes.

*   **Como interage e pega os dados?**
    *   Esta página é um **Componente de Servidor**. Isso significa que, quando você a acessa, o servidor executa as funções de busca de dados *antes* de enviar a página pronta para o seu navegador. Isso a torna muito rápida.
    *   Ela chama várias funções do `dashboardService.ts` (que por sua vez busca os dados mocados em `src/data/mock.ts`):
        *   `getDashboardMetrics()` para os cards.
        *   `getSalesLast7Days()` para o gráfico de vendas.
        *   `getTopProducts()` para o gráfico de produtos mais vendidos.
        *   E assim por diante para cada componente do dashboard.

### b) Página: `Ponto de Venda (PDV)` (`/admin/orders`)

*   **O que faz?**
    *   É o centro de operações de vendas.
    *   Exibe a lista de todos os pedidos existentes, permitindo alterar o status de cada um.
    *   Permite a criação rápida de um novo pedido para vendas de balcão.

*   **Como interage e pega os dados?**
    1.  **Carregamento:** A página principal (`page.tsx`) é um Componente de Servidor. Ela chama `getOrders()` e `getProducts()` do `orderService` e `productService` para buscar os dados iniciais.
    2.  **Interação:** Os dados são passados para o componente cliente `point-of-sale-client.tsx`, que gerencia toda a interatividade:
        *   **Criar Pedido:** Quando você adiciona produtos a um novo pedido e clica em "Finalizar", o componente chama a função `addOrder()` do `orderService`.
        *   **Alterar Status:** Quando você muda o status de um pedido na tabela, o componente chama `updateOrderStatus()` do `orderService`.
        *   Após cada ação, a lista de pedidos é atualizada na tela para refletir a mudança.

### c) Página: `Editar Pedido` (`/admin/orders/edit`)

*   **O que faz?**
    *   Permite modificar um pedido que já foi criado.
    *   O usuário pode alterar a quantidade de itens, adicionar novos produtos ou remover itens existentes.

*   **Como interage e pega os dados?**
    1.  **Carregamento:** A página identifica qual pedido editar através do ID na URL (ex: `.../edit?id=#PED-001`).
    2.  Ela chama a função `getOrderById(ID)` do `orderService` para buscar os detalhes daquele pedido específico e exibi-los.
    3.  **Salvando:** Quando você clica em "Salvar Alterações", a página chama a função `updateOrder()` do `orderService`, passando o ID do pedido e a nova lista de itens.

### d) Página: `Gerenciar Insumos` (`/admin/supplies`)

*   **O que faz?**
    *   É a página de controle de estoque de matéria-prima (farinha, açúcar, etc.).
    *   Lista todos os insumos e permite Adicionar, Editar ou Excluir cada um.

*   **Como interage e pega os dados?**
    1.  **Carregamento:** A página (`page.tsx`) busca a lista inicial de insumos chamando `getSupplies()` do `supplyService`.
    2.  **Interação:** Os dados são passados para o `supplies-client.tsx`:
        *   **Adicionar:** Ao preencher o formulário no `Dialog` e salvar, ele chama `addSupply()` do `supplyService`.
        *   **Editar:** Ao dar duplo clique em um item e salvar as alterações, ele chama `updateSupply()`.
        *   **Excluir:** Ao clicar no ícone de lixeira, ele chama `deleteSupply()`.

### e) Página: `Criar Receita` (`/admin/recipes`)

*   **O que faz?**
    *   É uma calculadora de custos avançada.
    *   Permite montar uma "receita" virtual adicionando insumos e suas quantidades para calcular o custo exato de produção de um item personalizado.
    *   Com base no custo e em uma margem de lucro, ela sugere um preço de venda e permite salvar essa receita como um "Pedido Personalizado".

*   **Como interage e pega os dados?**
    1.  **Carregamento:** A página busca a lista de todos os insumos disponíveis chamando `getSupplies()` do `supplyService`.
    2.  **Cálculo:** O componente `create-recipe-client.tsx` usa os dados dos insumos (custo por unidade) para calcular o custo total da receita em tempo real, conforme você adiciona ingredientes.
    3.  **Salvar como Pedido:** Ao clicar em "Salvar Pedido Personalizado", o componente reúne os detalhes da receita e chama a função `addOrder()` do `orderService`, criando um novo pedido na lista de pedidos gerais.

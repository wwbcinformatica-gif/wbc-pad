export interface ShoppingItem {
  name: string
  icon: string
  category: string
}

export const SHOPPING_ITEMS: ShoppingItem[] = [
  // Grãos e Cereais
  { name: "Arroz", icon: "🍚", category: "Grãos" },
  { name: "Feijão", icon: "🫘", category: "Grãos" },
  { name: "Feijão carioca", icon: "🫘", category: "Grãos" },
  { name: "Feijão preto", icon: "🫘", category: "Grãos" },
  { name: "Lentilha", icon: "🫘", category: "Grãos" },
  { name: "Macarrão", icon: "🍝", category: "Grãos" },
  { name: "Macarrão espaguete", icon: "🍝", category: "Grãos" },
  { name: "Fusili", icon: "🍝", category: "Grãos" },
  { name: "Penne", icon: "🍝", category: "Grãos" },
  { name: "Cuscuz", icon: "🍚", category: "Grãos" },
  { name: "Aveia", icon: "🥣", category: "Grãos" },
  { name: "Granola", icon: "🥣", category: "Grãos" },
  { name: "Cereal", icon: "🥣", category: "Grãos" },

  // Condimentos e Temperos
  { name: "Sal", icon: "🧂", category: "Temperos" },
  { name: "Açúcar", icon: "🍬", category: "Temperos" },
  { name: "Óleo", icon: "🫒", category: "Temperos" },
  { name: "Óleo de soja", icon: "🫒", category: "Temperos" },
  { name: "Azeite", icon: "🫒", category: "Temperos" },
  { name: "Vinagre", icon: "🍶", category: "Temperos" },
  { name: "Pimenta do reino", icon: "🌶️", category: "Temperos" },
  { name: "Páprica", icon: "🌶️", category: "Temperos" },
  { name: "Orégano", icon: "🌿", category: "Temperos" },
  { name: "Manjericão", icon: "🌿", category: "Temperos" },
  { name: "Cebola", icon: "🧅", category: "Temperos" },
  { name: "Alho", icon: "🧄", category: "Temperos" },
  { name: "Colorau", icon: "🌶️", category: "Temperos" },
  { name: "Cominho", icon: "🌿", category: "Temperos" },
  { name: "Curry", icon: "🌿", category: "Temperos" },
  { name: "Ketchup", icon: "🍅", category: "Temperos" },
  { name: "Maionese", icon: "🥫", category: "Temperos" },
  { name: "Mostarda", icon: "🟡", category: "Temperos" },
  { name: "Molho de pimenta", icon: "🌶️", category: "Temperos" },
  { name: "Shoyu", icon: "🍶", category: "Temperos" },
  { name: "Molho inglês", icon: "🍶", category: "Temperos" },

  // Laticínios
  { name: "Leite", icon: "🥛", category: "Laticínios" },
  { name: "Leite integral", icon: "🥛", category: "Laticínios" },
  { name: "Leite desnatado", icon: "🥛", category: "Laticínios" },
  { name: "Leite semi-desnatado", icon: "🥛", category: "Laticínios" },
  { name: "Manteiga", icon: "🧈", category: "Laticínios" },
  { name: "Margarina", icon: "🧈", category: "Laticínios" },
  { name: "Queijo mussarela", icon: "🧀", category: "Laticínios" },
  { name: "Queijo prato", icon: "🧀", category: "Laticínios" },
  { name: "Queijo minas", icon: "🧀", category: "Laticínios" },
  { name: "Requeijão", icon: "🧀", category: "Laticínios" },
  { name: "Creme de leite", icon: "🥛", category: "Laticínios" },
  { name: "Leite condensado", icon: "🥫", category: "Laticínios" },
  { name: "Iogurte", icon: "🥛", category: "Laticínios" },
  { name: "Ricota", icon: "🧀", category: "Laticínios" },

  // Carnes e Proteínas
  { name: "Frango", icon: "🍗", category: "Carnes" },
  { name: "Peito de frango", icon: "🍗", category: "Carnes" },
  { name: "Coxa de frango", icon: "🍗", category: "Carnes" },
  { name: "Carne moída", icon: "🥩", category: "Carnes" },
  { name: "Carne bovina", icon: "🥩", category: "Carnes" },
  { name: "Picanha", icon: "🥩", category: "Carnes" },
  { name: "Acém", icon: "🥩", category: "Carnes" },
  { name: "Alcatra", icon: "🥩", category: "Carnes" },
  { name: "Costela", icon: "🥩", category: "Carnes" },
  { name: "Lombo", icon: "🥩", category: "Carnes" },
  { name: "Bisteca", icon: "🥩", category: "Carnes" },
  { name: "Presunto", icon: "🥓", category: "Carnes" },
  { name: "Peperoni", icon: "🥓", category: "Carnes" },
  { name: "Linguiça", icon: "🌭", category: "Carnes" },
  { name: "Linguiça toscana", icon: "🌭", category: "Carnes" },
  { name: "Salsicha", icon: "🌭", category: "Carnes" },
  { name: "Bacon", icon: "🥓", category: "Carnes" },
  { name: "Calabresa", icon: "🌭", category: "Carnes" },
  { name: "Mortadela", icon: "🥓", category: "Carnes" },
  { name: "Salame", icon: "🥓", category: "Carnes" },

  // Peixes e Frutos do Mar
  { name: "Salmão", icon: "🐟", category: "Peixes" },
  { name: "Peixe", icon: "🐟", category: "Peixes" },
  { name: "Tilápia", icon: "🐟", category: "Peixes" },
  { name: "Camarão", icon: "🦐", category: "Peixes" },
  { name: "Lula", icon: "🦑", category: "Peixes" },
  { name: "Polvo", icon: "🦑", category: "Peixes" },

  // Frutas
  { name: "Banana", icon: "🍌", category: "Frutas" },
  { name: "Maçã", icon: "🍎", category: "Frutas" },
  { name: "Laranja", icon: "🍊", category: "Frutas" },
  { name: "Limão", icon: "🍋", category: "Frutas" },
  { name: "Abacaxi", icon: "🍍", category: "Frutas" },
  { name: "Mamão", icon: "🍈", category: "Frutas" },
  { name: "Melancia", icon: "🍉", category: "Frutas" },
  { name: "Melão", icon: "🍈", category: "Frutas" },
  { name: "Uva", icon: "🍇", category: "Frutas" },
  { name: "Morango", icon: "🍓", category: "Frutas" },
  { name: "Pera", icon: "🍐", category: "Frutas" },
  { name: "Pêssego", icon: "🍑", category: "Frutas" },
  { name: "Kiwi", icon: "🥝", category: "Frutas" },
  { name: "Manga", icon: "🥭", category: "Frutas" },
  { name: "Maracujá", icon: "🍊", category: "Frutas" },
  { name: "Coco", icon: "🥥", category: "Frutas" },
  { name: "Açaí", icon: "🫐", category: "Frutas" },
  { name: "Figo", icon: "🟣", category: "Frutas" },
  { name: "Tangerina", icon: "🍊", category: "Frutas" },
  { name: "Caqui", icon: "🟠", category: "Frutas" },

  // Legumes e Verduras
  { name: "Tomate", icon: "🍅", category: "Legumes" },
  { name: "Cenoura", icon: "🥕", category: "Legumes" },
  { name: "Batata", icon: "🥔", category: "Legumes" },
  { name: "Batata doce", icon: "🍠", category: "Legumes" },
  { name: "Mandioquinha", icon: "🥔", category: "Legumes" },
  { name: "Mandioca", icon: "🥔", category: "Legumes" },
  { name: "Inhame", icon: "🥔", category: "Legumes" },
  { name: "Abóbora", icon: "🎃", category: "Legumes" },
  { name: "Chuchu", icon: "🥒", category: "Legumes" },
  { name: "Pepino", icon: "🥒", category: "Legumes" },
  { name: "Alface", icon: "🥬", category: "Legumes" },
  { name: "Repolho", icon: "🥬", category: "Legumes" },
  { name: "Couve", icon: "🥬", category: "Legumes" },
  { name: "Brócolis", icon: "🥦", category: "Legumes" },
  { name: "Couve-flor", icon: "🥦", category: "Legumes" },
  { name: "Espinafre", icon: "🥬", category: "Legumes" },
  { name: "Agrião", icon: "🥬", category: "Legumes" },
  { name: "Rúcula", icon: "🥬", category: "Legumes" },
  { name: "Escarola", icon: "🥬", category: "Legumes" },
  { name: "Quiabo", icon: "🟢", category: "Legumes" },
  { name: "Vagem", icon: "🟢", category: "Legumes" },
  { name: "Berinjela", icon: "🍆", category: "Legumes" },
  { name: "Pimentão", icon: "🫑", category: "Legumes" },
  { name: "Milho", icon: "🌽", category: "Legumes" },
  { name: "Ervilha", icon: "🟢", category: "Legumes" },
  { name: "Palmito", icon: "🌴", category: "Legumes" },
  { name: "Beterraba", icon: "🟣", category: "Legumes" },

  // Panificadora e Padaria
  { name: "Pão francês", icon: "🍞", category: "Panificadora" },
  { name: "Pão de forma", icon: "🍞", category: "Panificadora" },
  { name: "Pão integral", icon: "🍞", category: "Panificadora" },
  { name: "Pão sírio", icon: "🫓", category: "Panificadora" },
  { name: "Pão de queijo", icon: "🧀", category: "Panificadora" },
  { name: "Bolo", icon: "🍰", category: "Panificadora" },
  { name: "Biscoito", icon: "🍪", category: "Panificadora" },
  { name: "Biscoito maizena", icon: "🍪", category: "Panificadora" },
  { name: "Torrada", icon: "🍞", category: "Panificadora" },
  { name: "Croissant", icon: "🥐", category: "Panificadora" },
  { name: "Sonho", icon: "🍩", category: "Panificadora" },
  { name: "Rosca", icon: "🍞", category: "Panificadora" },
  { name: "Focaccia", icon: "🍞", category: "Panificadora" },
  { name: "Pão aipim", icon: "🍞", category: "Panificadora" },

  // Bebidas
  { name: "Água", icon: "💧", category: "Bebidas" },
  { name: "Água mineral", icon: "💧", category: "Bebidas" },
  { name: "Suco de laranja", icon: "🧃", category: "Bebidas" },
  { name: "Suco de uva", icon: "🧃", category: "Bebidas" },
  { name: "Suco de maracujá", icon: "🧃", category: "Bebidas" },
  { name: "Refrigerante", icon: "🥤", category: "Bebidas" },
  { name: "Café", icon: "☕", category: "Bebidas" },
  { name: "Café em pó", icon: "☕", category: "Bebidas" },
  { name: "Café solúvel", icon: "☕", category: "Bebidas" },
  { name: "Chá", icon: "🍵", category: "Bebidas" },
  { name: "Cerveja", icon: "🍺", category: "Bebidas" },
  { name: "Vinho", icon: "🍷", category: "Bebidas" },

  // Higiene e Limpeza
  { name: "Sabão", icon: "🧼", category: "Higiene" },
  { name: "Sabonete", icon: "🧼", category: "Higiene" },
  { name: "Shampoo", icon: "🧴", category: "Higiene" },
  { name: "Condicionador", icon: "🧴", category: "Higiene" },
  { name: "Creme dental", icon: "🪥", category: "Higiene" },
  { name: "Escova de dente", icon: "🪥", category: "Higiene" },
  { name: "Papel higiênico", icon: "🧻", category: "Higiene" },
  { name: "Fio dental", icon: "🦷", category: "Higiene" },
  { name: "Desodorante", icon: "🧴", category: "Higiene" },
  { name: "Algodão", icon: "☁️", category: "Higiene" },
  { name: "Álcool", icon: "🍶", category: "Higiene" },
  { name: "Água sanitária", icon: "🧴", category: "Limpeza" },
  { name: "Detergente", icon: "🧴", category: "Limpeza" },
  { name: "Sabão em pó", icon: "📦", category: "Limpeza" },
  { name: "Amaciante", icon: "🧴", category: "Limpeza" },
  { name: "Esponja", icon: "🧽", category: "Limpeza" },
  { name: "Vassoura", icon: "🧹", category: "Limpeza" },
  { name: "Saco de lixo", icon: "🗑️", category: "Limpeza" },
  { name: "Multiuso", icon: "🧴", category: "Limpeza" },
  { name: "Desinfetante", icon: "🧴", category: "Limpeza" },

  // Frios e Congelados
  { name: "Pizza", icon: "🍕", category: "Congelados" },
  { name: "Lasanha", icon: "🍝", category: "Congelados" },
  { name: "Sorvete", icon: "🍦", category: "Congelados" },
  { name: "Polpa de fruta", icon: "🫐", category: "Congelados" },
  { name: "Nuggets", icon: "🍗", category: "Congelados" },
  { name: "Hambúrguer", icon: "🍔", category: "Congelados" },

  // Doces e Snacks
  { name: "Chocolate", icon: "🍫", category: "Doces" },
  { name: "Bombom", icon: "🍬", category: "Doces" },
  { name: "Pipoca", icon: "🍿", category: "Snacks" },
  { name: "Salgadinho", icon: "🌽", category: "Snacks" },

  // Ovos e Padaria
  { name: "Ovos", icon: "🥚", category: "Ovos" },
  { name: "Farinha de trigo", icon: "🌾", category: "Padaria" },
  { name: "Farinha de mandioca", icon: "🌾", category: "Padaria" },
  { name: "Fermento", icon: "📦", category: "Padaria" },

  // Pet
  { name: "Ração", icon: "🐾", category: "Pet" },
  { name: "Petisco", icon: "🦴", category: "Pet" },
]

export function filterShoppingItems(query: string): ShoppingItem[] {
  if (!query.trim()) return []
  const lower = query.toLowerCase().trim()
  return SHOPPING_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower)
  ).slice(0, 8)
}

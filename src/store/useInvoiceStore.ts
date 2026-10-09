import { create } from 'zustand';

export interface Item {
  id: number;
  description: string;
  qty: number;
  price: number;
}

interface InvoiceState {
  // Global Settings
  currency: string;
  setCurrency: (val: string) => void;
  activeLayout: 'A' | 'B' | 'C';
  setActiveLayout: (layout: 'A' | 'B' | 'C') => void;
  
  // Custom Headers
  headerDesc: string;
  headerQty: string;
  headerPrice: string;
  headerTotal: string;
  setHeaders: (patch: Partial<Pick<InvoiceState, 'headerDesc' | 'headerQty' | 'headerPrice' | 'headerTotal'>>) => void;

  // Invoice Data
  companyName: string;
  companyAddress: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  notes: string;
  logoUrl: string | null;
  logoPosition: 'left' | 'right' | 'top' | 'bottom';
  isDraggingLogo: boolean;
  setIsDraggingLogo: (isDragging: boolean) => void;
  
  // Items
  items: Item[];
  
  // Layout A Order
  layoutOrder: string[];

  // Layout B Regions
  layoutB_zones: {
    topLeft: string[];
    topRight: string[];
    main: string[];
    bottomLeft: string[];
    bottomRight: string[];
  };

  // Layout C Canvas/Palette
  layoutC_available: string[];
  layoutC_active: string[];

  // Actions
  updateField: (field: keyof InvoiceState, value: any) => void;
  addItem: () => void;
  updateItem: (id: number, patch: Partial<Item>) => void;
  removeItem: (id: number) => void;
  setLayoutOrder: (order: string[] | ((prev: string[]) => string[])) => void;
  setLayoutBZone: (zone: string, items: string[]) => void;
  setLayoutC: (available: string[], active: string[]) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  currency: '৳',
  activeLayout: 'A',
  headerDesc: 'Description',
  headerQty: 'Qty',
  headerPrice: 'Price',
  headerTotal: 'Total',
  companyName: 'Acme Co.',
  companyAddress: '123 Business Road, Dhaka, Bangladesh',
  clientName: 'Client Name',
  clientAddress: 'Client Address',
  invoiceNumber: 'INV-001',
  invoiceDate: new Date().toISOString().slice(0, 10),
  notes: 'Thank you for your business.',
  logoUrl: null,
  logoPosition: 'left',
  isDraggingLogo: false,
  items: [
    { id: 1, description: 'Web design', qty: 1, price: 15000 },
    { id: 2, description: 'Hosting (1 year)', qty: 1, price: 3000 },
  ],
  layoutOrder: ['header', 'billTo', 'table', 'totals', 'notes'],
  layoutB_zones: {
    topLeft: ['header'],
    topRight: ['billTo'],
    main: ['table'],
    bottomLeft: ['notes'],
    bottomRight: ['totals']
  },
  layoutC_available: [],
  layoutC_active: ['header', 'billTo', 'table', 'totals', 'notes'],

  setCurrency: (currency) => set({ currency }),
  setActiveLayout: (activeLayout) => set({ activeLayout }),
  setIsDraggingLogo: (isDraggingLogo) => set({ isDraggingLogo }),
  setHeaders: (patch) => set((state) => ({ ...state, ...patch })),
  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
  
  addItem: () => set((state) => ({
    items: [...state.items, { id: Date.now(), description: 'New item', qty: 1, price: 0 }]
  })),
  updateItem: (id, patch) => set((state) => ({
    items: state.items.map((it) => (it.id === id ? { ...it, ...patch } : it))
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((it) => it.id !== id)
  })),
  setLayoutOrder: (orderOrUpdater) => set((state) => ({
    layoutOrder: typeof orderOrUpdater === 'function' ? orderOrUpdater(state.layoutOrder) : orderOrUpdater
  })),
  setLayoutBZone: (zone, items) => set((state) => ({
    layoutB_zones: {
      ...state.layoutB_zones,
      [zone]: items
    }
  })),
  setLayoutC: (available, active) => set({
    layoutC_available: available,
    layoutC_active: active
  })
}));

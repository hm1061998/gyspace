# Confirm Service

Service modal confirm tái sử dụng để thay thế `window.confirm` và các modal confirm riêng lẻ.

## Cách sử dụng

### 1. Setup (đã được setup sẵn trong App.tsx)

```tsx
import ConfirmModal from "./components/ConfirmModal";

function App() {
  return (
    <>
      <ConfirmModal />
      {/* Your app content */}
    </>
  );
}
```

### 2. Sử dụng trong component

```tsx
import { confirmService } from "../services/confirmService";
import { toast } from "../services/toastService";

function MyComponent() {
  const handleDelete = async (id: string, name: string) => {
    confirmService.show({
      title: "Xác nhận xóa?",
      message: `Bạn có chắc chắn muốn xóa "${name}" không?`,
      type: "danger", // "danger" | "warning" | "info"
      confirmText: "Xóa ngay",
      cancelText: "Hủy",
      onConfirm: async () => {
        await deleteItem(id);
        toast.success("Đã xóa thành công!");
      },
    });
  };

  return <button onClick={() => handleDelete("123", "Item")}>Xóa</button>;
}
```

### 3. Các loại confirm

#### Danger (Nguy hiểm - màu đỏ)

```tsx
confirmService.show({
  title: "Xác nhận xóa?",
  message: "Hành động này không thể hoàn tác.",
  type: "danger",
  onConfirm: async () => {
    // Xử lý xóa
  },
});
```

#### Warning (Cảnh báo - màu vàng)

```tsx
confirmService.show({
  title: "Cảnh báo",
  message: "Bạn có chắc chắn muốn tiếp tục?",
  type: "warning",
  onConfirm: async () => {
    // Xử lý
  },
});
```

#### Info (Thông tin - màu xanh)

```tsx
confirmService.show({
  title: "Xác nhận",
  message: "Bạn có muốn lưu thay đổi?",
  type: "info",
  onConfirm: async () => {
    // Xử lý
  },
});
```

### 4. Sử dụng với Promise (nếu không dùng onConfirm callback)

```tsx
const handleAction = async () => {
  const confirmed = await confirmService.show({
    message: "Bạn có chắc chắn?",
    type: "warning",
  });

  if (confirmed) {
    // User clicked confirm
    await doSomething();
  } else {
    // User clicked cancel
    console.log("Cancelled");
  }
};
```

### 5. Phương thức tiện lợi

```tsx
// Danger confirm
await confirmService.danger("Bạn có chắc chắn muốn xóa?", "Xác nhận xóa");

// Warning confirm
await confirmService.warning("Dữ liệu sẽ bị mất", "Cảnh báo");

// Info confirm
await confirmService.info("Bạn có muốn tiếp tục?", "Thông báo");
```

## API Reference

### ConfirmOptions

```typescript
interface ConfirmOptions {
  title?: string; // Tiêu đề modal (mặc định: "Xác nhận")
  message: string; // Nội dung thông báo (bắt buộc)
  confirmText?: string; // Text nút xác nhận (mặc định: "Xác nhận")
  cancelText?: string; // Text nút hủy (mặc định: "Hủy")
  type?: "danger" | "warning" | "info"; // Loại confirm (mặc định: "info")
  onConfirm?: () => void | Promise<void>; // Callback khi confirm
  onCancel?: () => void; // Callback khi cancel
}
```

### Methods

- `confirmService.show(options: ConfirmOptions): Promise<boolean>`
- `confirmService.danger(message: string, title?: string): Promise<boolean>`
- `confirmService.warning(message: string, title?: string): Promise<boolean>`
- `confirmService.info(message: string, title?: string): Promise<boolean>`

## Ví dụ thực tế

### Thay thế window.confirm

**Trước:**

```tsx
const handleClearAll = () => {
  if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ?")) {
    clearAll();
  }
};
```

**Sau:**

```tsx
const handleClearAll = () => {
  confirmService.show({
    title: "Xóa toàn bộ?",
    message: "Bạn có chắc chắn muốn xóa toàn bộ lịch sử?",
    type: "warning",
    onConfirm: async () => {
      await clearAll();
      toast.success("Đã xóa!");
    },
  });
};
```

### Thay thế DeleteConfirmModal

**Trước:**

```tsx
const [deleteModal, setDeleteModal] = useState({
  isOpen: false,
  id: "",
  name: "",
});
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = (id, name) => {
  setDeleteModal({ isOpen: true, id, name });
};

const confirmDelete = async () => {
  setIsDeleting(true);
  try {
    await deleteItem(deleteModal.id);
    toast.success("Đã xóa!");
  } finally {
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, id: "", name: "" });
  }
};

return (
  <>
    <DeleteConfirmModal
      isOpen={deleteModal.isOpen}
      name={deleteModal.name}
      isDeleting={isDeleting}
      onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
      onConfirm={confirmDelete}
    />
    <button onClick={() => handleDelete(item.id, item.name)}>Xóa</button>
  </>
);
```

**Sau:**

```tsx
const handleDelete = (id, name) => {
  confirmService.show({
    title: "Xác nhận xóa?",
    message: `Bạn có chắc chắn muốn xóa "${name}"?`,
    type: "danger",
    confirmText: "Xóa ngay",
    onConfirm: async () => {
      await deleteItem(id);
      toast.success("Đã xóa!");
    },
  });
};

return <button onClick={() => handleDelete(item.id, item.name)}>Xóa</button>;
```

## Lợi ích

1. **Đơn giản hơn**: Không cần quản lý state cho modal
2. **Nhất quán**: UI đẹp và nhất quán trong toàn bộ ứng dụng
3. **Dễ bảo trì**: Tập trung logic ở một nơi
4. **Async/await**: Hỗ trợ async actions với loading state tự động
5. **Type-safe**: Full TypeScript support

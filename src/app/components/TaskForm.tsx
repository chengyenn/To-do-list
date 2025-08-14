import { Form, Input, Button, DatePicker, Textarea } from "@heroui/react";
import { Select, SelectItem, RadioGroup, Radio } from "@heroui/react";
import { ModalHeader, ModalBody } from "@heroui/react";
import { now, getLocalTimeZone, parseAbsolute } from "@internationalized/date";
import { useEffect, useState } from "react";
import { SelectOption } from "@/app/types/selectData";
import { TaskData } from "@/app/types/taskData";
import { v4 as uuidv4 } from "uuid";

export default function TaskForm({
  categories,
  setCategories,
  setTaskArray,
  editingTask,
  onModalClose,
}: {
  categories: SelectOption[];
  setCategories: (categories: SelectOption[]) => void;
  setTaskArray: React.Dispatch<React.SetStateAction<TaskData[]>>;
  editingTask?: TaskData | null;
  onModalClose: () => void;
}) {
  const [categoryName, setCategoryName] = useState<string>("");
  const [isAddedCategory, setisAddedCategory] = useState<boolean>(false);
  const [formState, setFormState] = useState({
    dateAndTime: now(getLocalTimeZone()),
    title: "",
    description: "",
    priority: "低" as "低" | "中" | "高",
    category: "",
  });

  // 編輯任務時，將任務資訊顯示於表單
  useEffect(() => {
    if (editingTask) {
      setFormState({
        // 將字串轉換成 ZonedDateTime 對象
        dateAndTime: parseAbsolute(editingTask.dateAndTime, getLocalTimeZone()),
        title: editingTask.title,
        description: editingTask.description || "",
        priority: editingTask.priority,
        category: editingTask.category,
      });
    } else {
      setFormState({
        dateAndTime: now(getLocalTimeZone()),
        title: "",
        description: "",
        priority: "低",
        category: "",
      });
    }
  }, [editingTask]);

  const handleAddCategory = () => {
    if (categoryName.trim() === "") {
      alert("請輸入分類名稱");
      return;
    } else {
      const exist = categories.some((c) => c.key === categoryName);
      if (exist) {
        alert("分類名稱已存在");
        return;
      }

      setCategories([
        ...categories,
        { key: categoryName, label: categoryName },
      ]);
      setCategoryName("");
      setisAddedCategory(false);
      alert(`已新增分類: ${categoryName}`);
    }
  };

  const handleCancel = () => {
    if (editingTask) {
      // 直接關閉，不重置表單
      onModalClose();
    } else {
      // 重置表單
      setFormState({
        title: "",
        description: "",
        priority: "低",
        category: "",
        dateAndTime: now(getLocalTimeZone()),
      });
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateTimeString = formData.get("dateAndTime") as string; // ex: 2025-08-09T17:30:32.352+08:00[Asia/Taipei]
    const cleanedDateTime = dateTimeString.replace(/\[.*\]/, ""); // 2025-08-09T17:30:32.352+08:00

    if (editingTask) {
      const updatedTask: TaskData = {
        ...editingTask,
        dateAndTime: cleanedDateTime,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        attachment: formData.get("attachment") as File | undefined,
        priority: formData.get("priority") as "低" | "中" | "高",
        category: formData.get("category") as string,
      };
      setTaskArray((prev) => {
        return prev.map((task) =>
          task.taskId === editingTask.taskId ? updatedTask : task
        );
      });
    } else {
      const taskObj: TaskData = {
        taskId: uuidv4(),
        dateAndTime: cleanedDateTime,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        attachment: formData.get("attachment") as File | undefined,
        priority: formData.get("priority") as "低" | "中" | "高",
        category: formData.get("category") as string,
        status: false,
      };
      console.log("Form data:", taskObj);

      setTaskArray((prev) => [...prev, taskObj]);
    }
    onModalClose();
  };
  return (
    <>
      <ModalHeader>Add Task</ModalHeader>
      <ModalBody>
        <Form className="w-full flex flex-col gap-4 pb-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-4 w-full">
            <DatePicker
              hideTimeZone
              labelPlacement="outside"
              label="日期與時間"
              name="dateAndTime"
              value={formState.dateAndTime}
              onChange={(value) => {
                if (value) {
                  setFormState((prev) => ({ ...prev, dateAndTime: value }));
                }
              }}
            />
            <Input
              isRequired
              labelPlacement="outside"
              placeholder="輸入待辦事項..."
              type="text"
              label="標題"
              name="title"
              value={formState.title}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Textarea
              labelPlacement="outside"
              maxRows={4}
              placeholder="輸入描述..."
              label="描述"
              name="description"
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <Input
              labelPlacement="outside"
              type="file"
              label="附件"
              name="attachment"
            />
            <RadioGroup
              color="warning"
              orientation="horizontal"
              label="優先順序"
              name="priority"
              value={formState.priority}
              onValueChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  priority: value as "低" | "中" | "高",
                }))
              }
            >
              <Radio value="低">低</Radio>
              <Radio value="中">中</Radio>
              <Radio value="高">高</Radio>
            </RadioGroup>
            <div className="flex items-end gap-2">
              <Select
                labelPlacement="outside"
                items={categories}
                placeholder="選擇分類..."
                label="分類"
                name="category"
                isRequired
                selectedKeys={formState.category ? [formState.category] : []}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                {(category) => <SelectItem>{category.label}</SelectItem>}
              </Select>
              <Button onPress={() => setisAddedCategory(true)}>+</Button>
            </div>
            {isAddedCategory && (
              <div className="flex gap-2 border-2 border-dashed p-2 rounded-lg border-[#447D9B]">
                <Input
                  placeholder="輸入新分類名稱..."
                  type="text"
                  variant="bordered"
                  className="w-2/3"
                  size="sm"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <Button
                  size="sm"
                  className="bg-[#447D9B] text-white"
                  onPress={handleAddCategory}
                >
                  V 確認
                </Button>
                <Button size="sm" onPress={() => setisAddedCategory(false)}>
                  X 取消
                </Button>
              </div>
            )}
          </div>
          <div className="flex self-end gap-2">
            <Button
              color="default"
              variant="ghost"
              type="button"
              onPress={handleCancel}
            >
              {editingTask ? "Cancel" : "Reset"}
            </Button>
            <Button className="bg-[#FE7743] text-white" type="submit">
              {editingTask ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </>
  );
}

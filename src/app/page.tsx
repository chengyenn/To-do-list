"use client";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import { Divider, Button, CheckboxGroup, Checkbox } from "@heroui/react";
import { Modal, ModalContent, useDisclosure, Chip, Input } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import {
  SelectOption,
  categoryArr,
  sortArr,
  priorityArr,
  statusArr,
} from "@/app/types/selectData";
import { TaskData } from "@/app/types/taskData";
import TaskForm from "@/app/components/TaskForm";
import { LiaClipboardListSolid } from "react-icons/lia";
import { MdDateRange, MdEdit, MdDelete, MdOutlineSearch } from "react-icons/md";

export default function Home() {
  const CATEGORY_STORAGE_KEY = "categories";
  const TASK_STORAGE_KEY = "tasks";
  const PRIORITY_COLOR_MAP = {
    低: "success",
    中: "warning",
    高: "danger",
  } as const;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [taskArray, setTaskArray] = useState<TaskData[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [selectedTask, setSelectedTask] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);

  // 搜尋、排序及篩選條件的 state
  const [searchWord, setSearchWord] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>(sortArr[0].key);
  const filterCategoryArr = [
    { key: "所有類別", label: "所有類別" },
    ...categories,
  ];
  const [selectedCategory, setSelectedCategory] = useState<string>(
    filterCategoryArr[0].key
  );
  const [selectedPriority, setSelectedPriority] = useState<string>(
    priorityArr[0].key
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    statusArr[0].key
  );

  // 初始載入時從 localStorage 讀取分類和 task
  useEffect(() => {
    const storedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
    const storedTasks = localStorage.getItem(TASK_STORAGE_KEY);
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
      console.log(
        "categories from localStorage:",
        JSON.parse(storedCategories)
      );
    } else {
      setCategories(categoryArr);
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categoryArr));
      console.log(
        "no categories in localStorage, using default categories:",
        categoryArr
      );
    }

    if (storedTasks) {
      const parsedTasks: TaskData[] = JSON.parse(storedTasks);
      setTaskArray(parsedTasks);
      console.log("tasks from localStorage:", JSON.parse(storedTasks));

      setSelectedTask(
        parsedTasks
          .filter((task) => task.status === true)
          .map((task) => task.taskId)
      );
    } else {
      setTaskArray([]);
    }
  }, []);

  // categories 更新時，同步到 localStorage
  useEffect(() => {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    console.log("Updated categories:", categories);
  }, [categories]);

  // 只要 taskArray 有更新，就同步到 localStorage
  useEffect(() => {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(taskArray));
    console.log("Updated tasks:", taskArray);
  }, [taskArray]);

  // 當任務完成時，更新 status 屬性
  useEffect(() => {
    setTaskArray((prev) =>
      prev.map((task) =>
        selectedTask.includes(task.taskId)
          ? { ...task, status: true }
          : { ...task, status: false }
      )
    );
  }, [selectedTask]);

  // 處理任務列表，根據排序、篩選和搜尋條件
  const getProcessedTasks = () => {
    // sort
    let sortedTasks;
    switch (sortBy) {
      case "addTimeNew":
        sortedTasks = [...taskArray].reverse();
        break;
      case "addTimeOld":
        sortedTasks = [...taskArray];
        break;
      case "timeEarly":
        sortedTasks = [...taskArray].sort(
          (a, b) =>
            new Date(a.dateAndTime).getTime() -
            new Date(b.dateAndTime).getTime()
        );
        break;
      case "timeLatest":
        sortedTasks = [...taskArray].sort(
          (a, b) =>
            new Date(b.dateAndTime).getTime() -
            new Date(a.dateAndTime).getTime()
        );
        break;
      default:
        sortedTasks = [...taskArray].reverse();
    }

    const hasFiltered =
      selectedCategory !== filterCategoryArr[0].key ||
      selectedPriority !== priorityArr[0].key ||
      selectedStatus !== statusArr[0].key;

    const hasSearched = searchWord.trim() !== "";

    // 如果沒有篩選條件及搜尋，直接返回排序後的任務
    if (!hasFiltered && !hasSearched) {
      return sortedTasks;
    }

    let processedTasks = sortedTasks;

    // filter
    if (hasFiltered) {
      const filteredTasks = processedTasks.filter((task) => {
        // 篩選類別
        const categoryMatch =
          selectedCategory === filterCategoryArr[0].key ||
          task.category === selectedCategory;

        // 篩選優先順序
        const priorityMatch =
          selectedPriority === priorityArr[0].key ||
          task.priority === selectedPriority;

        // 篩選狀態
        const statusMatch =
          selectedStatus === statusArr[0].key ||
          (selectedStatus === "已完成" && task.status === true) ||
          (selectedStatus === "進行中" && task.status === false);

        return categoryMatch && priorityMatch && statusMatch;
      });
      processedTasks = filteredTasks;
    }

    // search
    if (hasSearched) {
      const searchTasks = processedTasks.filter((task) =>
        task.title
          .trim()
          .toLowerCase()
          .includes(searchWord.trim().toLowerCase())
      );
      processedTasks = searchTasks;
    }
    return processedTasks.length > 0 ? processedTasks : sortedTasks;
  };

  const processedTasks = getProcessedTasks();

  const editTask = (task: TaskData) => {
    setEditingTask(task);
    onOpen();
  };

  const deleteTask = (taskId: string) => {
    setTaskArray((prev) => prev.filter((task) => task.taskId !== taskId));
  };

  return (
    <div className="bg-[#D7D7D7] h-screen flex items-center justify-center">
      <Card className="w-2/3 h-3/4 shadow-lg">
        <CardHeader className="flex p-4 w-full justify-between">
          <div className="flex gap-3 items-center">
            <LiaClipboardListSolid size={30} className="text-sky-800" />
            <p className="font-bold text-lg text-sky-800">To Do List</p>
            <Chip size="sm" className="px-2 text-gray-600">
              {processedTasks.length}
            </Chip>
          </div>
          <Input
            isClearable
            placeholder="Search..."
            radius="lg"
            className="w-1/3"
            variant="bordered"
            startContent={
              <MdOutlineSearch className="text-gray-500" size={20} />
            }
            value={searchWord}
            onValueChange={setSearchWord}
          />
        </CardHeader>
        <Divider />
        {/* sort and filter */}
        <div className="flex gap-2 px-6 py-4 bg-gray-50">
          <Select
            className="w-1/3"
            label="排序"
            labelPlacement="outside"
            size="sm"
            variant="faded"
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortArr.map((sortItem) => (
              <SelectItem key={sortItem.key}>{sortItem.label}</SelectItem>
            ))}
          </Select>
          <div className="flex w-2/3 gap-2 ">
            <Select
              label="篩選(類別)"
              labelPlacement="outside"
              size="sm"
              variant="faded"
              selectedKeys={[selectedCategory]}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {filterCategoryArr.map((category) => (
                <SelectItem key={category.key}>{category.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="篩選(優先順序)"
              labelPlacement="outside"
              size="sm"
              variant="faded"
              selectedKeys={[selectedPriority]}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              {priorityArr.map((priority) => (
                <SelectItem key={priority.key}>{priority.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="篩選(狀態)"
              labelPlacement="outside"
              size="sm"
              variant="faded"
              selectedKeys={[selectedStatus]}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusArr.map((stats) => (
                <SelectItem key={stats.key}>{stats.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <Divider />
        <CardBody className="px-8 py-4 flex flex-col gap-4">
          {/* list */}
          {taskArray.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              還沒有任何任務，點擊下方按鈕新增任務吧！
            </div>
          ) : (
            <CheckboxGroup
              color="warning"
              value={selectedTask}
              onValueChange={setSelectedTask}
              radius="full"
            >
              {processedTasks.map((task, index) => {
                return (
                  <div key={task.taskId}>
                    {index !== 0 && <Divider className="mb-4" />}
                    <div className="flex items-center justify-between">
                      <Checkbox value={task.taskId}>
                        <div className="flex flex-col gap-1">
                          <h3
                            className={`${
                              selectedTask.includes(task.taskId)
                                ? "line-through text-gray-600"
                                : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span className="text-sm text-gray-400">
                            {task.description}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-sm text-red-700/80">
                              <MdDateRange />
                              {new Date(task.dateAndTime).toLocaleString()}
                            </span>
                            <Chip color="primary" size="sm" variant="flat">
                              {task.category}
                            </Chip>
                            <Chip
                              color={
                                PRIORITY_COLOR_MAP[task.priority] || "default"
                              }
                              variant="flat"
                              className="px-4"
                            >
                              {task.priority}
                            </Chip>
                          </div>
                        </div>
                      </Checkbox>
                      <div className="flex gap-6 pr-6">
                        <button onClick={() => editTask(task)}>
                          <MdEdit
                            size={25}
                            className="text-gray-300 hover:text-[#FE7743]"
                          />
                        </button>
                        <button onClick={() => deleteTask(task.taskId)}>
                          <MdDelete
                            size={25}
                            className="text-gray-300 hover:text-red-700/80"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CheckboxGroup>
          )}
        </CardBody>
        <CardFooter className="flex justify-end p-4">
          <>
            <Button onPress={onOpen} className="bg-sky-800 text-white">
              Add Task
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <TaskForm
                    categories={categories}
                    setCategories={setCategories}
                    setTaskArray={setTaskArray}
                    editingTask={editingTask}
                    onModalClose={() => {
                      setEditingTask(null);
                      onClose();
                    }}
                  />
                )}
              </ModalContent>
            </Modal>
          </>
        </CardFooter>
      </Card>
    </div>
  );
}

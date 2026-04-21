import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, GripVertical, CheckCircle2, Circle, Trash2,
  ChevronDown, ChevronUp, Tag, Calendar, Flag,
} from 'lucide-react';
import {
  useTasks, useCreateTask, useUpdateTask, useUpdateTaskStatus,
  useDeleteTask, useReorderTasks,
} from '../hooks/useTasks';
import type { Task, TaskStatus, TaskPriority } from '../stores/task.store';
import { useTaskStore } from '../stores/task.store';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Skeleton } from './ui/Skeleton';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const PRIORITY_COLOR: Record<TaskPriority, 'default' | 'primary' | 'warning' | 'danger'> = {
  LOW: 'default', MEDIUM: 'primary', HIGH: 'warning', URGENT: 'danger',
};

const STATUS_COLOR: Record<TaskStatus, 'default' | 'primary' | 'success' | 'danger'> = {
  TODO: 'default', IN_PROGRESS: 'primary', DONE: 'success', CANCELLED: 'danger',
};

function SortableTask({
  task, onEdit, onDelete, onToggle,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (t: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)',
        cursor: 'default',
        borderLeft: task.status === 'DONE' ? '3px solid var(--accent-green)' : '3px solid transparent',
        marginBottom: '0.5rem',
      }}
    >
      <span {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)', flexShrink: 0 }}>
        <GripVertical size={16} />
      </span>
      <button
        onClick={() => onToggle(task)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, color: task.status === 'DONE' ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex' }}
      >
        {task.status === 'DONE' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)',
          fontWeight: 500,
          textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title}
        </p>
        {task.dueDate && (
          <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={11} />
            {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <Badge variant={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
        <Badge variant={STATUS_COLOR[task.status]}>{task.status.replace('_', ' ')}</Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(task)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Flag size={14} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-coral)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
}

const DEFAULT_FORM: TaskFormData = {
  title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', tags: '',
};

export default function Tasks() {
  const { filters, setFilters } = useTaskStore();
  const { data: tasks, isLoading } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>(DEFAULT_FORM);
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const filtered = (tasks ?? []).filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditingTask(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags.join(', '),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = {
      title: form.title.trim(),
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    setModalOpen(false);
  }

  async function handleToggle(task: Task) {
    const newStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    await updateStatus.mutateAsync({ id: task.id, status: newStatus });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !tasks) return;
    const oldIdx = tasks.findIndex((t) => t.id === active.id);
    const newIdx = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIdx, newIdx);
    reorderTasks.mutate(reordered.map((t) => t.id));
  }

  const todoCount = (tasks ?? []).filter((t) => t.status === 'TODO').length;
  const doneCount = (tasks ?? []).filter((t) => t.status === 'DONE').length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            {todoCount} to do · {doneCount} completed
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreate}>
          New Task
        </Button>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody style={{ padding: '0.875rem 1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={15} />}
              style={{ flex: 1 }}
            />
            <Button
              variant="ghost"
              rightIcon={showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              onClick={() => setShowFilters((v) => !v)}
            >
              Filters
            </Button>
          </div>
          {showFilters && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <Select
                value={filters.status ?? ''}
                onChange={(e) => setFilters({ status: e.target.value as TaskStatus || undefined })}
                style={{ minWidth: 140 }}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
              <Select
                value={filters.priority ?? ''}
                onChange={(e) => setFilters({ priority: e.target.value as TaskPriority || undefined })}
                style={{ minWidth: 140 }}
              >
                <option value="">All Priorities</option>
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
              {(filters.status || filters.priority) && (
                <Button variant="ghost" onClick={() => setFilters({ status: undefined, priority: undefined })}>
                  Clear
                </Button>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Task list */}
      {isLoading ? (
        <Card><CardBody><Skeleton lines={5} /></CardBody></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--accent-green)', marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {search ? 'No tasks match your search' : 'No tasks yet. Create your first task!'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {filtered.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={(id) => deleteTask.mutate(id)}
                onToggle={handleToggle}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Task title"
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Priority</label>
              <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}>
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Status</label>
              <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <Input
            label="Tags"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="work, urgent, project (comma-separated)"
            prefix={<Tag size={14} />}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={createTask.isPending || updateTask.isPending}
              disabled={!form.title.trim()}
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

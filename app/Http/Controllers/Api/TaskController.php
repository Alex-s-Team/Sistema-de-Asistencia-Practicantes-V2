<?php
// app/Http/Controllers/Api/TaskController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::with(['creator', 'assignedUsers']);

        if ($user->isIntern()) {
            // Practicantes solo ven sus tareas
            $query->whereHas('assignedUsers', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to') && $user->canManageUsers()) {
            $query->whereHas('assignedUsers', function($q) use ($request) {
                $q->where('user_id', $request->assigned_to);
            });
        }

        $tasks = $query->orderBy('due_date', 'asc')
                      ->paginate($request->get('per_page', 15));

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->canManageUsers()) {
            return response()->json([
                'message' => 'No tienes permisos para crear tareas',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:start_date',
            'priority' => 'required|in:low,medium,high',
            'assigned_users' => 'required|array|min:1',
            'assigned_users.*' => 'exists:users,id',
        ]);

        try {
            DB::beginTransaction();

            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'created_by' => $user->id,
                'start_date' => $validated['start_date'],
                'due_date' => $validated['due_date'],
                'priority' => $validated['priority'],
                'status' => 'pending',
            ]);

            $task->assignedUsers()->attach($validated['assigned_users']);

            DB::commit();

            return response()->json([
                'message' => 'Tarea creada exitosamente',
                'task' => $task->load(['creator', 'assignedUsers']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear la tarea',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $task = Task::with(['creator', 'assignedUsers'])->findOrFail($id);

        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        // Solo el creador o admin/staff pueden editar
        if (!$user->canManageUsers() && $task->created_by !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para editar esta tarea',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'start_date' => 'sometimes|date',
            'due_date' => 'sometimes|date',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'progress' => 'sometimes|integer|min:0|max:100',
            'assigned_users' => 'sometimes|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        try {
            DB::beginTransaction();

            $task->update($validated);

            if (isset($validated['assigned_users'])) {
                $task->assignedUsers()->sync($validated['assigned_users']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Tarea actualizada exitosamente',
                'task' => $task->load(['creator', 'assignedUsers']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la tarea',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $user = request()->user();
        $task = Task::findOrFail($id);

        if (!$user->canManageUsers() && $task->created_by !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para eliminar esta tarea',
            ], 403);
        }

        $task->delete();

        return response()->json([
            'message' => 'Tarea eliminada exitosamente',
        ]);
    }

    public function myTasks(Request $request)
    {
        $user = $request->user();

        $tasks = Task::with(['creator', 'assignedUsers'])
            ->whereHas('assignedUsers', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderBy('due_date', 'asc')
            ->get();

        $grouped = [
            'pending' => $tasks->where('status', 'pending')->values(),
            'in_progress' => $tasks->where('status', 'in_progress')->values(),
            'completed' => $tasks->where('status', 'completed')->values(),
            'overdue' => $tasks->filter->isOverdue()->values(),
        ];

        return response()->json($grouped);
    }
}


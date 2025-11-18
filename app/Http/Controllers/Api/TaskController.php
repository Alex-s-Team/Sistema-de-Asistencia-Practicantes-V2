<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $query = Task::with(['assignedUsers', 'creator']);

            // Si es practicante, solo ver sus tareas
            if ($user->isIntern()) {
                $query->whereHas('assignedUsers', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }

            $tasks = $query->orderBy('created_at', 'desc')->get();

            // Agrupar por estado
            $grouped = [
                'pending' => $tasks->where('status', 'pending')->values(),
                'in_progress' => $tasks->where('status', 'in_progress')->values(),
                'completed' => $tasks->where('status', 'completed')->values(),
            ];

            return response()->json($grouped);
        } catch (\Exception $e) {
            Log::error('Error in TaskController@index:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener tareas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function myTasks(Request $request)
    {
        try {
            $user = $request->user();

            $tasks = Task::with(['assignedUsers', 'creator'])
                ->whereHas('assignedUsers', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            // Agrupar por estado
            $grouped = [
                'pending' => $tasks->where('status', 'pending')->values(),
                'in_progress' => $tasks->where('status', 'in_progress')->values(),
                'completed' => $tasks->where('status', 'completed')->values(),
            ];

            return response()->json($grouped);
        } catch (\Exception $e) {
            Log::error('Error in TaskController@myTasks:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener mis tareas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canManageUsers()) {
                return response()->json([
                    'message' => 'No tienes permisos para crear tareas',
                ], 403);
            }

            // Logging para debug
            Log::info('Task creation request:', $request->all());

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'priority' => 'required|in:low,medium,high',
                'status' => 'nullable|in:pending,in_progress,completed,cancelled',
                'start_date' => 'required|date',
                'due_date' => 'required|date|after_or_equal:start_date',
                'assigned_users' => 'required|array|min:1',
                'assigned_users.*' => 'required|integer|exists:users,id',
            ], [
                'assigned_users.required' => 'Debes asignar al menos un usuario',
                'assigned_users.*.exists' => 'Uno o más usuarios seleccionados no existen',
            ]);

            DB::beginTransaction();

            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'priority' => $validated['priority'],
                'status' => $validated['status'] ?? 'pending',
                'start_date' => $validated['start_date'],
                'due_date' => $validated['due_date'],
                'created_by' => $user->id,
            ]);

            // Convertir a enteros y asignar
            $userIds = array_map('intval', $validated['assigned_users']);
            $task->assignedUsers()->attach($userIds);

            DB::commit();

            $task->load(['assignedUsers', 'creator']);

            return response()->json([
                'message' => 'Tarea creada exitosamente',
                'task' => $task,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error in TaskController@store:', [
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in TaskController@store:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al crear tarea',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $task = Task::with(['assignedUsers', 'creator'])->findOrFail($id);
            return response()->json($task);
        } catch (\Exception $e) {
            Log::error('Error in TaskController@show:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Tarea no encontrada',
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = $request->user();
            $task = Task::findOrFail($id);

            if (!$user->canManageUsers() && $task->created_by !== $user->id) {
                return response()->json([
                    'message' => 'No tienes permisos para editar esta tarea',
                ], 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'priority' => 'sometimes|in:low,medium,high',
                'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
                'start_date' => 'sometimes|date',
                'due_date' => 'sometimes|date|after_or_equal:start_date',
                'assigned_users' => 'sometimes|array|min:1',
                'assigned_users.*' => 'integer|exists:users,id',
            ]);

            DB::beginTransaction();

            $task->update(array_filter($validated, function($key) {
                return $key !== 'assigned_users';
            }, ARRAY_FILTER_USE_KEY));

            if (isset($validated['assigned_users'])) {
                $task->assignedUsers()->sync($validated['assigned_users']);
            }

            DB::commit();

            $task->load(['assignedUsers', 'creator']);

            return response()->json([
                'message' => 'Tarea actualizada exitosamente',
                'task' => $task,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in TaskController@update:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al actualizar tarea',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Error in TaskController@destroy:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error al eliminar tarea',
            ], 500);
        }
    }
}
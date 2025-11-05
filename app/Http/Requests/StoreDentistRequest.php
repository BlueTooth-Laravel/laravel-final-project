<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @method User|null user($guard = null)
 */
class StoreDentistRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only admins (role_id = 1) can create dentists.
     */
    public function authorize(): bool
    {
        return $this->user()?->role_id === 1;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fname' => 'required|string|max:255',
            'mname' => 'nullable|string|max:255',
            'lname' => 'required|string|max:255',
            'gender' => 'required|string|in:Male,Female,Other',
            'contact_number' => 'nullable|string|max:20|unique:users,contact_number',
            'email' => 'required|string|email|max:255|unique:users,email',
            'avatar' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048', // 2MB max
            'specialization_ids' => 'nullable|array',
            'specialization_ids.*' => 'exists:specializations,id',
            'employment_status' => 'nullable|string|in:Active,Un-hire',
            'hire_date' => 'nullable|date',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'fname' => 'first name',
            'mname' => 'middle name',
            'lname' => 'last name',
            'contact_number' => 'contact number',
            'specialization_ids' => 'specializations',
            'specialization_ids.*' => 'specialization',
            'employment_status' => 'employment status',
            'hire_date' => 'hire date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fname.required' => 'The first name field is required.',
            'lname.required' => 'The last name field is required.',
            'gender.required' => 'Please select a gender.',
            'gender.in' => 'The selected gender is invalid.',
            'email.required' => 'The email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'contact_number.unique' => 'This contact number is already registered.',
            'avatar.image' => 'The avatar must be an image file.',
            'avatar.mimes' => 'The avatar must be a file of type: jpeg, jpg, png, gif.',
            'avatar.max' => 'The avatar file size must not exceed 2MB.',
            'specialization_ids.*.exists' => 'The selected specialization is invalid.',
            'employment_status.in' => 'The employment status must be either Active or Un-hire.',
            'hire_date.date' => 'The hire date must be a valid date.',
        ];
    }
}

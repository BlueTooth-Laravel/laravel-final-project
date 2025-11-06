<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @method User|null user($guard = null)
 * @method bool has(string $key)
 * @method mixed input(string $key = null, mixed $default = null)
 * @method void merge(array $input)
 * @property-read string|null $contact_number
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
            'contact_number' => [
                'nullable',
                'string',
                'regex:/^(\+63|0)[\s\-\(\)]?[0-9\s\-\(\)]{9,13}$/',
                'unique:users,contact_number',
            ],
            'email' => 'required|string|email|max:255|unique:users,email',
            'avatar' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048', // 2MB max
            'specialization_ids' => 'nullable|array',
            'specialization_ids.*' => 'exists:specializations,id',
            'employment_status' => 'nullable|string|in:Active,Un-hire',
            'hire_date' => 'nullable|date',
        ];
    }

    /**
     * Prepare the data for validation.
     * Formats the contact number before validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('contact_number') && $this->contact_number) {
            $this->merge([
                'contact_number' => $this->formatPhoneNumber($this->contact_number),
            ]);
        }
    }

    /**
     * Format Philippine phone number to standard format: 0111 111 1111
     * Accepts inputs:
     * - +63XXXXXXXXXX
     * - 0XXXXXXXXXXX
     * - Numbers with spaces, dashes, parentheses
     */
    private function formatPhoneNumber(string $phoneNumber): ?string
    {
        // Remove all non-digit characters except +
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        // Handle +63 prefix
        if (str_starts_with($cleaned, '+63')) {
            $cleaned = '0' . substr($cleaned, 3);
        }

        // Remove leading zeros if more than one
        $cleaned = ltrim($cleaned, '0');
        $cleaned = '0' . $cleaned;

        // Validate length (should be 11 digits for PH mobile numbers)
        if (strlen($cleaned) !== 11) {
            return null;
        }

        // Format: 0111 111 1111
        return substr($cleaned, 0, 4) . ' ' . substr($cleaned, 4, 3) . ' ' . substr($cleaned, 7, 4);
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
            'contact_number.regex' => 'Invalid phone number format. Please enter a valid Philippine phone number (e.g., 0917 123 4567 or +63 917 123 4567).',
            'contact_number.unique' => 'This phone number is already registered.',
            'avatar.image' => 'The avatar must be an image file.',
            'avatar.mimes' => 'The avatar must be a file of type: jpeg, jpg, png, gif.',
            'avatar.max' => 'The avatar file size must not exceed 2MB.',
            'specialization_ids.*.exists' => 'The selected specialization is invalid.',
            'employment_status.in' => 'The employment status must be either Active or Un-hire.',
            'hire_date.date' => 'The hire date must be a valid date.',
        ];
    }
}

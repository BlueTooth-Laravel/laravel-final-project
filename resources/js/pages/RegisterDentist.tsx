import type { DentistFormData, RegisterDentistProps } from '@/types';
import { router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';

export default function RegisterDentist({
    specializations = [],
    errors = {},
}: RegisterDentistProps) {
    const [formData, setFormData] = useState<DentistFormData>({
        fname: '',
        mname: '',
        lname: '',
        gender: '',
        contact_number: '',
        email: '',
        avatar: null,
        specialization_ids: [],
        employment_status: 'Active',
        hire_date: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string>('');

    const formatPhoneNumberDisplay = (value: string): string => {
        // Remove all non-digit characters except +
        const cleaned = value.replace(/[^\d+]/g, '');

        // Handle +63 prefix
        let digits = cleaned;
        if (digits.startsWith('+63')) {
            digits = '0' + digits.substring(3);
        }

        // Remove extra leading zeros
        digits = digits.replace(/^0+/, '0');

        // Limit to 11 digits
        digits = digits.substring(0, 11);

        // Format: 0111 111 1111
        if (digits.length > 7) {
            return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
        } else if (digits.length > 4) {
            return `${digits.substring(0, 4)} ${digits.substring(4)}`;
        }
        return digits;
    };

    const validatePhoneNumber = (value: string): boolean => {
        if (!value) return true; // Optional field

        // Remove all formatting
        const cleaned = value.replace(/[^\d+]/g, '');

        // Check if starts with +63 or 0
        if (!cleaned.startsWith('+63') && !cleaned.startsWith('0')) {
            setPhoneError('Phone number must start with +63 or 0');
            return false;
        }

        // Convert to standard format for length check
        let digits = cleaned;
        if (digits.startsWith('+63')) {
            digits = '0' + digits.substring(3);
        }

        // Check length (must be 11 digits)
        if (digits.length !== 11) {
            setPhoneError(
                'Phone number must be 11 digits (e.g., 0917 123 4567)',
            );
            return false;
        }

        setPhoneError('');
        return true;
    };

    const handleInputChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;

        // Special handling for phone number
        if (name === 'contact_number') {
            const formatted = formatPhoneNumberDisplay(value);
            setFormData((prev) => ({
                ...prev,
                [name]: formatted,
            }));
            validatePhoneNumber(formatted);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                avatar: file,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSpecializationChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const isChecked = e.target.checked;

        setFormData((prev) => ({
            ...prev,
            specialization_ids: isChecked
                ? [...prev.specialization_ids, value]
                : prev.specialization_ids.filter((id) => id !== value),
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate phone number before submission
        if (
            formData.contact_number &&
            !validatePhoneNumber(formData.contact_number)
        ) {
            return;
        }

        const submitData = new FormData();
        submitData.append('fname', formData.fname);
        submitData.append('mname', formData.mname);
        submitData.append('lname', formData.lname);
        submitData.append('gender', formData.gender);
        submitData.append('contact_number', formData.contact_number);
        submitData.append('email', formData.email);
        submitData.append('hire_date', formData.hire_date);

        if (formData.avatar) {
            submitData.append('avatar', formData.avatar);
        }

        formData.specialization_ids.forEach((id, index) => {
            submitData.append(`specialization_ids[${index}]`, id.toString());
        });

        router.post('/admin/dentists', submitData, {
            preserveScroll: true,
            onSuccess: () => {
                alert(
                    'Dentist registered successfully! An email has been sent with login credentials.',
                );
            },
        });
    };

    return (
        <div>
            <h1>Register New Dentist</h1>
            <p>
                Fill in the details below to register a new dentist. A default
                password will be auto-generated and sent via email.
            </p>

            <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <fieldset>
                    <legend>Personal Information</legend>

                    <div>
                        <label htmlFor="fname">
                            First Name <span>*</span>
                        </label>
                        <input
                            type="text"
                            id="fname"
                            name="fname"
                            value={formData.fname}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.fname && <span>{errors.fname}</span>}
                    </div>

                    <div>
                        <label htmlFor="mname">Middle Name</label>
                        <input
                            type="text"
                            id="mname"
                            name="mname"
                            value={formData.mname}
                            onChange={handleInputChange}
                        />
                        {errors.mname && <span>{errors.mname}</span>}
                    </div>

                    <div>
                        <label htmlFor="lname">
                            Last Name <span>*</span>
                        </label>
                        <input
                            type="text"
                            id="lname"
                            name="lname"
                            value={formData.lname}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.lname && <span>{errors.lname}</span>}
                        <small>
                            Used to generate default password: lastname_XXXX
                        </small>
                    </div>

                    <div>
                        <label htmlFor="gender">
                            Gender <span>*</span>
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <span>{errors.gender}</span>}
                    </div>
                </fieldset>

                {/* Contact Information Section */}
                <fieldset>
                    <legend>Contact Information</legend>

                    <div>
                        <label htmlFor="email">
                            Email <span>*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.email && <span>{errors.email}</span>}
                        <small>
                            Login credentials will be sent to this email
                        </small>
                    </div>

                    <div>
                        <label htmlFor="contact_number">Contact Number</label>
                        <input
                            type="tel"
                            id="contact_number"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleInputChange}
                            placeholder="0917 123 4567 or +63 917 123 4567"
                            maxLength={16}
                        />
                        {(errors.contact_number || phoneError) && (
                            <span style={{ color: 'red' }}>
                                {errors.contact_number || phoneError}
                            </span>
                        )}
                        <small>
                            Accepts: +63 prefix, 0 prefix, or plain numbers.
                            Will be formatted as: 0111 111 1111
                        </small>
                    </div>
                </fieldset>

                {/* Profile Picture Section */}
                <fieldset>
                    <legend>Profile Picture</legend>

                    <div>
                        <label htmlFor="avatar">Avatar (Optional)</label>
                        <input
                            type="file"
                            id="avatar"
                            name="avatar"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleFileChange}
                        />
                        {errors.avatar && <span>{errors.avatar}</span>}
                        <small>
                            Max size: 2MB. Accepted formats: JPEG, JPG, PNG, GIF
                        </small>

                        {avatarPreview && (
                            <div>
                                <p>Preview:</p>
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </fieldset>

                {/* Specializations Section */}
                <fieldset>
                    <legend>Specializations (Optional)</legend>

                    {specializations.length > 0 ? (
                        <div>
                            {specializations.map((spec) => (
                                <div key={spec.id}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={spec.id}
                                            checked={formData.specialization_ids.includes(
                                                spec.id,
                                            )}
                                            onChange={
                                                handleSpecializationChange
                                            }
                                        />
                                        {spec.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No specializations available</p>
                    )}
                    {errors.specialization_ids && (
                        <span>{errors.specialization_ids}</span>
                    )}
                </fieldset>

                {/* Employment Information Section */}
                <fieldset>
                    <legend>Employment Information</legend>

                    <div>
                        <label htmlFor="hire_date">Hire Date</label>
                        <input
                            type="date"
                            id="hire_date"
                            name="hire_date"
                            value={formData.hire_date}
                            onChange={handleInputChange}
                        />
                        {errors.hire_date && <span>{errors.hire_date}</span>}
                        <small>
                            Employment status will be set to "Active" by default
                        </small>
                    </div>
                </fieldset>

                {/* Password Information */}
                <div
                    style={{
                        backgroundColor: '#f0f8ff',
                        padding: '15px',
                        border: '1px solid #0066cc',
                        borderRadius: '5px',
                        margin: '20px 0',
                    }}
                >
                    <h3>📧 Password Information</h3>
                    <ul>
                        <li>
                            A default password will be automatically generated
                        </li>
                        <li>
                            Format: <code>lastname_XXXX</code> (4 random digits)
                        </li>
                        <li>Credentials will be sent to the dentist's email</li>
                        <li>Dentist must change password on first login</li>
                    </ul>
                </div>

                {/* Submit Button */}
                <div>
                    <button type="submit">Register Dentist</button>
                    <button
                        type="button"
                        onClick={() => router.visit('/admin/dentists')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

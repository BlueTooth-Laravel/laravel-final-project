import {
    genderSchema,
    nameSchema,
    optionalEmailSchema,
    optionalNameSchema,
    phoneNumberSchema,
} from '@/lib/validations';
import type { AddPatientProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const patientFormSchema = z.object({
    fname: nameSchema('First name'),
    mname: optionalNameSchema('Middle name'),
    lname: nameSchema('Last name'),
    gender: genderSchema,
    contact_number: phoneNumberSchema,
    email: optionalEmailSchema,
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    address: z
        .string()
        .max(500, 'Address must not exceed 500 characters')
        .optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

export default function AddPatient({ errors = {} }: AddPatientProps) {
    const {
        register,
        handleSubmit,
        formState: { errors: formErrors, isSubmitting },
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            fname: '',
            mname: '',
            lname: '',
            gender: undefined,
            contact_number: '',
            email: '',
            date_of_birth: '',
            address: '',
        },
    });

    const onSubmit = (data: PatientFormData) => {
        router.post('/patients', data, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Patient added successfully!');
            },
        });
    };

    return (
        <div>
            <h1>Add New Patient</h1>
            <p>Fill in the details below to add a new patient record.</p>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Personal Information Section */}
                <fieldset>
                    <legend>Personal Information</legend>

                    <div>
                        <label htmlFor="fname">
                            First Name <span>*</span>
                        </label>
                        <input type="text" id="fname" {...register('fname')} />
                        {(formErrors.fname || errors.fname) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.fname?.message || errors.fname}
                            </span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="mname">Middle Name</label>
                        <input type="text" id="mname" {...register('mname')} />
                        {(formErrors.mname || errors.mname) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.mname?.message || errors.mname}
                            </span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="lname">
                            Last Name <span>*</span>
                        </label>
                        <input type="text" id="lname" {...register('lname')} />
                        {(formErrors.lname || errors.lname) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.lname?.message || errors.lname}
                            </span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="gender">
                            Gender <span>*</span>
                        </label>
                        <select id="gender" {...register('gender')}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {(formErrors.gender || errors.gender) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.gender?.message || errors.gender}
                            </span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="date_of_birth">
                            Date of Birth <span>*</span>
                        </label>
                        <input
                            type="date"
                            id="date_of_birth"
                            {...register('date_of_birth')}
                        />
                        {(formErrors.date_of_birth || errors.date_of_birth) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.date_of_birth?.message ||
                                    errors.date_of_birth}
                            </span>
                        )}
                    </div>
                </fieldset>

                {/* Contact Information Section */}
                <fieldset>
                    <legend>Contact Information</legend>

                    <div>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" {...register('email')} />
                        {(formErrors.email || errors.email) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.email?.message || errors.email}
                            </span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="contact_number">Contact Number</label>
                        <input
                            type="tel"
                            id="contact_number"
                            {...register('contact_number')}
                            placeholder="0917 123 4567 or +63 917 123 4567"
                            maxLength={16}
                        />
                        {(formErrors.contact_number ||
                            errors.contact_number) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.contact_number?.message ||
                                    errors.contact_number}
                            </span>
                        )}
                        <small>
                            Accepts: +63 prefix, 0 prefix, or plain numbers.
                        </small>
                    </div>

                    <div>
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            {...register('address')}
                            rows={3}
                        />
                        {(formErrors.address || errors.address) && (
                            <span style={{ color: 'red' }}>
                                {formErrors.address?.message || errors.address}
                            </span>
                        )}
                    </div>
                </fieldset>

                {/* Submit Button */}
                <div>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Patient'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.visit('/patients')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

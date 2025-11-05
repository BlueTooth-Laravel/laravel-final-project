import type { ViewDentistProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function ViewDentist({ dentist }: ViewDentistProps) {
    return (
        <>
            <Head title={`View Dentist - ${dentist.full_name}`} />

            <div>
                <div>
                    <Link href="/dentists">← Back to Dentists List</Link>
                </div>

                <div>
                    <div>
                        <h1>Dentist Profile</h1>
                    </div>

                    <div>
                        {/* Avatar Section */}
                        <div>
                            {dentist.avatar_url ? (
                                <img
                                    src={dentist.avatar_url}
                                    alt={`${dentist.full_name}'s avatar`}
                                />
                            ) : (
                                <div>
                                    <span>
                                        {dentist.fname.charAt(0)}
                                        {dentist.lname.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <h2>{dentist.full_name}</h2>
                            <p>Dentist</p>
                        </div>

                        {/* Details Section */}
                        <div>
                            <div>
                                <div>
                                    <h3>First Name</h3>
                                    <p>{dentist.fname}</p>
                                </div>

                                {dentist.mname && (
                                    <div>
                                        <h3>Middle Name</h3>
                                        <p>{dentist.mname}</p>
                                    </div>
                                )}

                                <div>
                                    <h3>Last Name</h3>
                                    <p>{dentist.lname}</p>
                                </div>

                                <div>
                                    <h3>Gender</h3>
                                    <p>{dentist.gender}</p>
                                </div>

                                <div>
                                    <h3>Email</h3>
                                    <p>
                                        <a href={`mailto:${dentist.email}`}>
                                            {dentist.email}
                                        </a>
                                    </p>
                                </div>

                                {dentist.contact_number && (
                                    <div>
                                        <h3>Contact Number</h3>
                                        <p>{dentist.contact_number}</p>
                                    </div>
                                )}

                                <div>
                                    <h3>Employment Status</h3>
                                    <p>
                                        <span>
                                            {dentist.employment_status || 'N/A'}
                                        </span>
                                    </p>
                                </div>

                                {dentist.hire_date_formatted && (
                                    <div>
                                        <h3>Hire Date</h3>
                                        <p>{dentist.hire_date_formatted}</p>
                                    </div>
                                )}

                                <div>
                                    <h3>Specializations</h3>
                                    {dentist.specializations.length > 0 ? (
                                        <div>
                                            {dentist.specializations.map(
                                                (spec) => (
                                                    <span key={spec.id}>
                                                        {spec.name}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p>No specializations assigned</p>
                                    )}
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h3>Account Information</h3>
                                <div>
                                    <div>
                                        <h4>Email Verified</h4>
                                        <p>
                                            {dentist.email_verified_at ? (
                                                <span>✓ Verified</span>
                                            ) : (
                                                <span>✗ Not Verified</span>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <h4>Password Status</h4>
                                        <p>
                                            {dentist.must_change_password ? (
                                                <span>
                                                    Must Change Password
                                                </span>
                                            ) : (
                                                <span>Password Set</span>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <h4>Account Created</h4>
                                        <p>{dentist.created_at_formatted}</p>
                                    </div>

                                    {dentist.archived_at && (
                                        <div>
                                            <h4>Status</h4>
                                            <p>Archived</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div>
                        <Link href={`/dentists/${dentist.id}/edit`}>
                            Edit Profile
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

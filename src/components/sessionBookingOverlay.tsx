import React, { useState } from 'react';

type SessionBookingOverlayProps = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
};

const SessionBookingOverlay: React.FC<SessionBookingOverlayProps> = ({
    isModalOpen,
    setIsModalOpen,
}) => {
    return (
        <>
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsModalOpen(false);
                        }
                    }}
                >
                    <div className="w-96 h-96 p-4 bg-white rounded-2xl justify-start items-center gap-4 inline-flex">
                        <p>Modal</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default SessionBookingOverlay;
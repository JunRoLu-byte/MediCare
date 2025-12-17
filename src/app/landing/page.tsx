'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LandingPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('inicio');

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const services = [
        {
            icon: '🩺',
            title: 'Consulta General',
            description: 'Atención médica integral para toda la familia',
            price: 'S/ 80 - S/ 120'
        },
        {
            icon: '❤️',
            title: 'Cardiología',
            description: 'Especialistas en salud cardiovascular',
            price: 'S/ 150 - S/ 250'
        },
        {
            icon: '🦴',
            title: 'Traumatología',
            description: 'Tratamiento de lesiones y problemas óseos',
            price: 'S/ 120 - S/ 200'
        },
        {
            icon: '👶',
            title: 'Pediatría',
            description: 'Cuidado especializado para niños',
            price: 'S/ 90 - S/ 150'
        },
        {
            icon: '🧠',
            title: 'Neurología',
            description: 'Diagnóstico y tratamiento del sistema nervioso',
            price: 'S/ 180 - S/ 280'
        },
        {
            icon: '🔬',
            title: 'Análisis Clínicos',
            description: 'Laboratorio completo con resultados rápidos',
            price: 'S/ 30 - S/ 200'
        },
        {
            icon: '📷',
            title: 'Radiología',
            description: 'Estudios de imagen de última generación',
            price: 'S/ 80 - S/ 300'
        },
        {
            icon: '💉',
            title: 'Vacunación',
            description: 'Programa completo de inmunizaciones',
            price: 'S/ 40 - S/ 150'
        }
    ];

    const doctors = [
        {
            name: 'Dr. Carlos Mendoza',
            specialty: 'Cardiólogo',
            experience: '15 años de experiencia',
            certifications: 'Certificado por el Colegio Médico del Perú',
            image: '👨‍⚕️'
        },
        {
            name: 'Dra. María González',
            specialty: 'Pediatra',
            experience: '12 años de experiencia',
            certifications: 'Especialista en Neonatología',
            image: '👩‍⚕️'
        },
        {
            name: 'Dr. Roberto Silva',
            specialty: 'Traumatólogo',
            experience: '18 años de experiencia',
            certifications: 'Cirujano Ortopédico Certificado',
            image: '👨‍⚕️'
        },
        {
            name: 'Dra. Ana Torres',
            specialty: 'Neuróloga',
            experience: '10 años de experiencia',
            certifications: 'Especialista en Neurología Clínica',
            image: '👩‍⚕️'
        }
    ];

    return (
        <div className={styles.landingContainer}>
            {/* Navigation */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🏥</div>
                        <span className={styles.logoText}>MediCare Perú</span>
                    </div>
                    <div className={styles.navLinks}>
                        <button
                            onClick={() => scrollToSection('inicio')}
                            className={activeSection === 'inicio' ? styles.active : ''}
                        >
                            Inicio
                        </button>
                        <button
                            onClick={() => scrollToSection('nosotros')}
                            className={activeSection === 'nosotros' ? styles.active : ''}
                        >
                            Nosotros
                        </button>
                        <button
                            onClick={() => scrollToSection('servicios')}
                            className={activeSection === 'servicios' ? styles.active : ''}
                        >
                            Servicios
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className={styles.loginButton}
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Inicio */}
            <section id="inicio" className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>
                            Tu Salud es Nuestra
                            <span className={styles.highlight}> Prioridad</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Consultoría médica de excelencia con profesionales altamente calificados.
                            Brindamos atención personalizada y tecnología de vanguardia para tu bienestar.
                        </p>
                        <div className={styles.heroButtons}>
                            <button
                                className={styles.primaryButton}
                                onClick={() => router.push('/signup')}
                            >
                                Agenda tu Cita
                            </button>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => scrollToSection('servicios')}
                            >
                                Ver Servicios
                            </button>
                        </div>
                        <div className={styles.heroStats}>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>15+</div>
                                <div className={styles.statLabel}>Especialistas</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>10,000+</div>
                                <div className={styles.statLabel}>Pacientes Atendidos</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>98%</div>
                                <div className={styles.statLabel}>Satisfacción</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.heroImage}>
                        <div className={styles.imageCircle}>
                            <div className={styles.floatingIcon} style={{ top: '10%', left: '10%' }}>🩺</div>
                            <div className={styles.floatingIcon} style={{ top: '20%', right: '15%' }}>❤️</div>
                            <div className={styles.floatingIcon} style={{ bottom: '25%', left: '5%' }}>💊</div>
                            <div className={styles.floatingIcon} style={{ bottom: '15%', right: '10%' }}>🔬</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Values */}
            <section className={styles.valuesSection}>
                <div className={styles.valuesGrid}>
                    <div className={styles.valueCard}>
                        <div className={styles.valueIcon}>🎯</div>
                        <h3>Misión</h3>
                        <p>
                            Proporcionar servicios médicos de la más alta calidad,
                            centrados en el paciente y respaldados por la última tecnología médica.
                        </p>
                    </div>
                    <div className={styles.valueCard}>
                        <div className={styles.valueIcon}>🔭</div>
                        <h3>Visión</h3>
                        <p>
                            Ser la consultoría médica líder en Perú, reconocida por nuestra
                            excelencia, innovación y compromiso con la salud de nuestros pacientes.
                        </p>
                    </div>
                    <div className={styles.valueCard}>
                        <div className={styles.valueIcon}>⭐</div>
                        <h3>Valores</h3>
                        <p>
                            Integridad, profesionalismo, empatía y dedicación absoluta
                            al bienestar de cada persona que confía en nosotros.
                        </p>
                    </div>
                </div>
            </section>

            {/* About Us / Medical Team */}
            <section id="nosotros" className={styles.teamSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Nuestro Equipo Médico</h2>
                    <p className={styles.sectionSubtitle}>
                        Profesionales altamente capacitados dedicados a tu salud
                    </p>
                </div>
                <div className={styles.doctorsGrid}>
                    {doctors.map((doctor, index) => (
                        <div key={index} className={styles.doctorCard}>
                            <div className={styles.doctorImage}>{doctor.image}</div>
                            <h3 className={styles.doctorName}>{doctor.name}</h3>
                            <div className={styles.doctorSpecialty}>{doctor.specialty}</div>
                            <div className={styles.doctorInfo}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>📅</span>
                                    <span>{doctor.experience}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>🏆</span>
                                    <span>{doctor.certifications}</span>
                                </div>
                            </div>
                            <button className={styles.contactButton}>
                                Agendar Consulta
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section id="servicios" className={styles.servicesSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
                    <p className={styles.sectionSubtitle}>
                        Atención médica integral con tecnología de vanguardia
                    </p>
                </div>
                <div className={styles.servicesGrid}>
                    {services.map((service, index) => (
                        <div key={index} className={styles.serviceCard}>
                            <div className={styles.serviceIcon}>{service.icon}</div>
                            <h3 className={styles.serviceTitle}>{service.title}</h3>
                            <p className={styles.serviceDescription}>{service.description}</p>
                            <div className={styles.servicePrice}>{service.price}</div>
                            <button className={styles.serviceButton}>
                                Más Información
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>¿Listo para cuidar tu salud?</h2>
                    <p className={styles.ctaSubtitle}>
                        Agenda tu cita hoy y experimenta atención médica de clase mundial
                    </p>
                    <div className={styles.ctaButtons}>
                        <button
                            className={styles.ctaPrimary}
                            onClick={() => router.push('/signup')}
                        >
                            Crear Cuenta
                        </button>
                        <button
                            className={styles.ctaSecondary}
                            onClick={() => router.push('/login')}
                        >
                            Ya tengo cuenta
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerSection}>
                        <div className={styles.footerLogo}>
                            <div className={styles.logoIcon}>🏥</div>
                            <span>MediCare Perú</span>
                        </div>
                        <p className={styles.footerDescription}>
                            Tu salud es nuestra prioridad. Brindamos servicios médicos
                            de excelencia con profesionales altamente calificados.
                        </p>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Contacto</h4>
                        <div className={styles.contactInfo}>
                            <p>📞 +51 1 234 5678</p>
                            <p>📧 contacto@medicare.pe</p>
                            <p>📍 Av. Principal 123, Lima, Perú</p>
                        </div>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Horarios</h4>
                        <div className={styles.scheduleInfo}>
                            <p>Lunes - Viernes: 8:00 AM - 8:00 PM</p>
                            <p>Sábados: 9:00 AM - 2:00 PM</p>
                            <p>Domingos: Emergencias</p>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>&copy; 2024 MediCare Perú. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

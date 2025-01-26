import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react';

const AboutUs = () => {
    return (
        <div style={styles.safe_area}>
            <div style={styles.main_view}>
                <ScrollView style={{ overflowY: 'auto' }}>

                    <div style={styles.image_view}>
                        <Image
                            src="path_to_your_logo_image/logo.png"
                            alt="IzzyAI Logo"
                            style={styles.image}
                        />
                    </div>

                    <Text style={styles.heading}>
                        Welcome to IzzyAI
                    </Text>
                    <Text style={styles.heading}>
                        Your Speech Companion!
                    </Text>
                    <Text style={styles.para}>
                        Embark on a journey to clear and confident speech with IzzyAI. Our
                        avatar-led exercises, powered by AI, target Articulation,
                        Stammering, Voice, Receptive Language, and Expressive Language Disorders. Let's unlock your communication
                        potential together.
                    </Text>

                    <Text style={styles.heading2}>Vision</Text>

                    <Text style={styles.para}>
                        Accessibility to timely assessment and a variety of therapeutic exercises for everyone.
                    </Text>

                    <Text style={styles.heading2}>Mission</Text>

                    <Text style={styles.para}>
                        IzzyAI Avatar-based assessments and interventions are tailored to
                        the specific needs of the users.
                    </Text>

                    <Text style={styles.heading}>Rationale</Text>
                    <Text style={styles.para}>
                        IzzyAI is the only human avatar-based model that captures audio-visual and emotional features of the user and provides comprehensive assessments and exercises. The wide variety of therapy options, especially the gamification, provides an easy and captivating intervention method. IzzyAI model training is based on data of articulation, stammering, voice, receptive language, and expressive language disorders.
                    </Text>

                    <div style={{ height: 20 }} />
                </ScrollView>
            </div>
        </div>
    );
};

export default AboutUs;

const styles = {
    safe_area: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'white',
    },
    main_view: {
        flex: 1,
        padding: '20px',
    },
    image_view: {
        height: '80px',
        width: '40%',
        margin: 'auto',
    },
    image: {
        height: '100%',
        width: '100%',
    },
    heading: {
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        color: 'black',
        fontSize: '30px',
        fontWeight: '500',
        marginTop: '10px',
    },
    para: {
        fontSize: '15px',
        fontWeight: '400',
        marginTop: '15px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        color: 'black',
    },
    heading2: {
        marginTop: '15px',
        fontSize: '25px',
        fontWeight: '500',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        color: 'black',
    },
};


import { GetServerSideProps } from 'next'
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import styles from './styles.module.css'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'
import { TextArea } from '@/components/textarea'

import { db } from '@/services/firebaseConnection'
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import Link from 'next/link'
import { TaskItemProps } from '@/interfaces'

interface DashboardProps{
    user: {
        email: string;
    }
}

export default function Dashboard({ user }: DashboardProps) {
    const [input, setInput] = useState('')
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskItemProps[]>([])

    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault();
        if (input === '') return;
        
        try {
            await addDoc(collection(db, 'tasks'), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask,
            })

            setInput('')
            setPublicTask(false)
        } catch (error) {
            console.log('ERROR', error)
        }
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );

        alert('URL da Task Copiada com sucesso!')
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, 'tasks', id)
        await deleteDoc(docRef)
    }

    
    useEffect(() => {
        async function loadTarefas() {
            const tarefasRef = collection(db, 'tasks')
    
            const q = query(
                tarefasRef,
                orderBy('created', 'desc'),
                where('user', '==', user?.email)
            );

            onSnapshot(q, (snapshot) => {
                let list = [] as TaskItemProps[]

                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public,
                    })
                })

                setTasks(list)
            })
        }
        loadTarefas()
    }, [user?.email])

    return (
        <div className={styles.container}>
            <Head>
                <title>Painel de tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>
                            Qual sua tarefa?
                        </h1>
                        <form onSubmit={handleRegisterTask}>
                            <TextArea
                                value={input}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                                placeholder='Digite sua tarefa'
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    id='public-task'
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={(e) => setPublicTask(e.target.checked)}
                                    />
                                <label htmlFor='public-task'>Deixar tarefa pública?</label>
                            </div>

                            <button className={styles.button} type='submit'>
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    {tasks.length > 0 ? tasks.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public &&
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag} htmlFor="">PÚBLICO</label>
                                    <button
                                        onClick={() => handleShare(item.id)}
                                        className={styles.shareButton}>
                                        <FiShare2
                                            size={22}
                                            color='#3183ff' />
                                    </button>
                                </div>
                            }
                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p dangerouslySetInnerHTML={{
                                            __html: item.tarefa.replace('/n', '</br>')
                                        }}></p>
                                    </Link>
                                ) : (
                                    <p dangerouslySetInnerHTML={{
                                        __html: item.tarefa.replace('/n', '</br>')
                                    }}></p>
                                )}
                                <button
                                    onClick={() => handleDeleteTask(item.id)}
                                    className={styles.trashButton}>
                                    <FaTrash
                                        size={18}
                                        color='#ea3140' />
                                </button>
                            </div>
                        </article>
                    )) :
                        <span className={styles.nonTask}>Você ainda não possui tarefas.</span>
                    }
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
    const session = await getSession({ req })

    if (!session?.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }
    return {
        props: {
            user: {
                email: session.user.email,
            }
        }
    }
}
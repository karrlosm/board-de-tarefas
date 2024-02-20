import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import styles from './styles.module.css'

export function Header() {

    const { data: session, status } = useSession();

    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href={'/'}>
                        <h1 className={styles.logo}>
                            Board de <span>Tarefas</span>
                        </h1>
                    </Link>
                    {session?.user &&
                        <Link href={'/dashboard'} className={styles.link}>
                            Meu Painel
                        </Link>
                    }
                </nav>
                {status === 'loading' ? (
                    <>
                    </>
                ) : session?.user ? 
                    (
                        <button
                            onClick={() => signOut()}
                            className={styles.loginButton}>
                                Olá, {session.user?.name}
                        </button>
                    ) :
                    (
                        <button
                            onClick={() => signIn('google')}
                            className={styles.loginButton}>
                            Acessar
                        </button>
                    )
                }
            </section>
        </header>
    )
}
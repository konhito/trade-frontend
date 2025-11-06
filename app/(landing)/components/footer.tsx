'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Mail, MessageCircle, Send, Youtube } from 'lucide-react'

export default function Footer() {
  const navigation = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Business', href: '/business' },
      { name: 'Support', href: '/support' },
    ],
    company: [
      { name: 'About', href: '/about' },
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Disclaimers', href: '/disclaimers' },
    ],
    social: [
      { 
        name: 'WhatsApp', 
        href: 'https://wa.me/919977642137', 
        icon: MessageCircle,
        external: true
      },
      { 
        name: 'Telegram', 
        href: 'https://t.me/DECAYHUNTERS', 
        icon: Send,
        external: true
      },
      { 
        name: 'Email', 
        href: 'mailto:MyTradeJournal99@gmail.com', 
        icon: Mail,
        external: true
      },
      { 
        name: 'YouTube', 
        href: 'https://youtube.com/@decayhunters?si=BReRB1o2IXPsD47V', 
        icon: Youtube,
        external: true
      },
    ],
  }

  return (
    <footer aria-labelledby="footer-heading" className="py-12 transition-colors duration-300 max-w-7xl mx-auto">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto px-4">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <Logo className="h-8 w-8 mr-2 fill-black dark:fill-white" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MyTradeJournal</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The comprehensive trading journal that helps you analyze performance and improve your trading decisions.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => {
                const IconComponent = item.icon
                if (item.external) {
                  return (
                    <a 
                      key={item.name} 
                      href={item.href} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label={item.name}
                    >
                      <span className="sr-only">{item.name}</span>
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </a>
                  )
                }
                return (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <IconComponent className="h-6 w-6" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Product</h4>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h4 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Company</h4>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Legal</h4>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} MyTradeJournal. All rights reserved.
          </div>
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
            Risk Warning: Trading involves substantial risk of loss. Past performance is not indicative of future results.
          </div>
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
            Hypothetical Performance Disclaimer: CFTC Rule 4.41 - Hypothetical or simulated performance results have certain limitations.
          </div>
        </div>
      </div>
    </footer>
  )
}
import { html, useState, useEffect, useRef } from '/preact-htm-standalone.js'
import ShowCharacter from './show-character.js'

const getNavFromHash = () => {
    const suffix = window.location.hash.split('#database/characters/')[1] || '?'
    const [hanzi, search] = suffix.split('?')
    return { hanzi: decodeURIComponent(hanzi), search: decodeURIComponent(search || '') }
}

const PAGE_SIZE = 30
const SEARCH_FIELDS = [
    { value: '', label: 'All fields' },
    { value: 'hanzi', label: 'Hanzi' },
    { value: 'pinyin', label: 'Pinyin' },
    { value: 'meaning', label: 'Meaning' }
]

export default function Characters() {
    const [nav, setNav] = useState(getNavFromHash())
    const [characters, setCharacters] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchField, setSearchField] = useState('')
    const searchRef = useRef(null)
    const listRef = useRef(null)

    useEffect(() => (!nav.search && searchRef.current) ? searchRef.current.focus() : null, [nav.search])

    useEffect(() => {
        const debounceHandler = setTimeout(() => {
            setPage(1)
            setCharacters([])
            fetchCharacters(1, true)
        }, 300)
        return () => clearTimeout(debounceHandler)
    }, [nav.search, searchField])

    useEffect(() => {
        const onHashChange = () => setNav(getNavFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            if (!listRef.current || loading) return
            const { scrollTop, scrollHeight, clientHeight } = listRef.current
            if (scrollHeight - scrollTop - clientHeight < 100 && characters.length < total) {
                fetchCharacters(page + 1)
            }
        }
        const el = listRef.current
        if (el) el.addEventListener('scroll', handleScroll)
        return () => el && el.removeEventListener('scroll', handleScroll)
    }, [characters, total, page, loading])

    const fetchCharacters = async (fetchPage = 1, reset = false) => {
        setLoading(true)
        const searchParam = nav.search ? `&search=${nav.search}` : ''
        const fieldParam = searchField ? `&searchField=${searchField}` : ''
        const res = await fetch(`/api/list-characters?page=${fetchPage}&pageSize=${PAGE_SIZE}${searchParam}${fieldParam}`)
        const data = await res.json()
        setCharacters(reset ? data.characters : [...characters, ...data.characters])
        setPage(data.page)
        setTotal(data.total)
        setLoading(false)
    }

    const search = (newSearchTerm) => {
        setNav({ ...nav, search: newSearchTerm })
        const searchHash = newSearchTerm ? `/?${newSearchTerm}` : ''
        history.replaceState(null, '', `#database/characters${searchHash}`)
    }

    if (nav.hanzi) return html`<${ShowCharacter} hanzi=${nav.hanzi} onClose=${() => history.back()} />`

    return html`
        <div style="display: flex; gap: 0.5em; align-items: center; margin-bottom: 0.5em;">
            <input ref=${searchRef} type='text' placeholder='Type to search...' value=${nav.search} oninput=${e => search(e.target.value)} />
            <select value=${searchField} onchange=${e => setSearchField(e.target.value)} style="width: auto;">
                ${SEARCH_FIELDS.map(f => html`<option value=${f.value}>${f.label}</option>`)}
            </select>
        </div>
        ${characters.length === 0 && !loading ? html`<div class=minor>No characters found.</div>` : html``}
        <ul ref=${listRef} style='overflow: auto; padding: 0; margin: 0; border: 1px solid #eee;'>
            ${characters.map(character => html`
            <li style='display: flex; gap: 0.2em; padding: 0.2em 0; border-bottom: 1px solid #eee;'>
                <a href='#database/characters/${character.hanzi}' style='white-space: nowrap;'>${character.hanzi}</a><span class='minor elipsible'>(${character.pinyin})</span>
            </li>
            `)}
            ${loading ? html`<li class='minor'>Loading...</li>` : ''}
        </ul>
    `
}

// components/CourseCard.tsx
'use client'

import Link from 'next/link'

interface CourseCardProps {
  id: string
  title: string
  description: string
  imageUrl?: string
  price: number
}

export default function CourseCard({
  id,
  title,
  description,
  imageUrl,
  price,
}: CourseCardProps) {
  return (
    <div className="rounded-xl shadow-md p-4 border bg-white">
      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-40 object-cover rounded" />}
      <h2 className="text-lg font-semibold mt-2">{title}</h2>
      <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      <p className="font-bold mt-2">$ {(price / 100).toFixed(2)}</p>
      <Link href={`/curso/${id}`}>
        <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded">
          Ver curso
        </button>
      </Link>
    </div>
  )
}

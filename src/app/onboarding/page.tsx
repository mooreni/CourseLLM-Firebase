"use client"

import React, { useState } from "react"
import { useAuth } from "@/components/AuthProviderClient"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

const SEED_COURSES = [
  { id: "11111111-1111-1111-1111-111111111111", code: "CS204", title: "Data Structures" },
  { id: "22222222-2222-2222-2222-222222222222", code: "IR101", title: "Information Retrieval" },
  { id: "33333333-3333-3333-3333-333333333333", code: "RAG301", title: "Retrieval Augmented Generation" },
]

function OnboardingContent() {
  const { firebaseUser, profile, refreshProfile } = useAuth()
  const [department, setDepartment] = useState(profile?.department || "")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [courses, setCourses] = useState<string[]>(profile?.courses || [])
  const [role, setRole] = useState<"student" | "teacher">((profile?.role as any) || "student")
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (!firebaseUser) router.replace("/login")
  }, [firebaseUser, router])

  if (!firebaseUser) return null


  const addSelectedCourse = () => {
    const v = selectedCourseId.trim()
    if (v && !courses.includes(v)) {
      setCourses((c) => [...c, v])
    }
    setSelectedCourseId("")
  }

  const courseLabelById = (courseId: string) => {
    const c = SEED_COURSES.find((x) => x.id === courseId)
    return c ? `${c.code} — ${c.title}` : courseId
  }


  const removeCourse = (c: string) => setCourses((list) => list.filter((x) => x !== c))

  const handleSave = async () => {
    if (!firebaseUser) return
    if (!role || !department) {
      // lightweight client validation
      alert("Please choose a role and enter your department.")
      return
    }
    setSaving(true)
    try {
      const userDoc = doc(db, "users", firebaseUser.uid)
      await setDoc(
        userDoc,
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role,
          department,
          courses,
          authProviders: firebaseUser.providerData?.map((p) => p.providerId.replace(/\.com$/, "")) || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          profileComplete: true,
        },
        { merge: true }
      )

      await fetch(`${process.env.NEXT_PUBLIC_SEARCH_SERVICE_URL}/v1/users/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
        },
        body: JSON.stringify({
          role,
          department,
          courses, // should be course_ids from your dropdown
        }),
      })
      

      try {
        await refreshProfile()
      } catch (e) {
        console.warn("refreshProfile failed after onboarding save:", e)
      }

      router.replace(role === "student" ? "/student" : "/teacher")
    } catch (err) {
      console.error("Failed saving profile:", err)
      alert("Failed to save profile. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Set up your profile</CardTitle>
          <CardDescription>Tell us a bit about yourself so we can personalize your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <div className="flex gap-2">
                <Button variant={role === "student" ? "default" : "outline"} onClick={() => setRole("student")}>
                  Student
                </Button>
                <Button variant={role === "teacher" ? "default" : "outline"} onClick={() => setRole("teacher")}>
                  Teacher
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
              <p className="text-sm text-muted-foreground mt-1">Free-text department. You can refine this later.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Courses</label>

              <div className="flex gap-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="" disabled>
                    Select a course…
                  </option>

                  {SEED_COURSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>

                <Button onClick={addSelectedCourse} disabled={!selectedCourseId}>
                  Add
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {courses.map((courseId) => (
                  <Badge key={courseId} className="inline-flex items-center gap-2">
                    <span>{courseLabelById(courseId)}</span>
                    <button
                      onClick={() => removeCourse(courseId)}
                      aria-label={`Remove ${courseLabelById(courseId)}`}
                      className="text-xs opacity-80"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>


            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? "Saving..." : "Save and Continue"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OnboardingPage() {
  return <OnboardingContent />
}
